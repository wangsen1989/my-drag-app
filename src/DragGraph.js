/* 
  已实现功能：
  1：整个图容器、节点、边，他们的 连接、分离、拖动、放大缩小, 都会触发自身状态更改，并将新状态通知父组件
*/

/* 
  TODO: 
  1: 是否多锚点，已连接的线是否可删除、是否可用鼠标分离，初始值是否有坐标
  2: 不可自己连自己，不可重复链接，
  3: 判断 环，并将错误的环标识出 或 禁用锚点
  4: 是否可有环(有向)。[ 1 -> 2 -> 3 -> 4 -> 1 ]，只判断最后操作的节点 4 的出度，是否有指回自己的入度和入度的入度
  5: 如下路径，虽然没环，但 1 被 4 跨层级重复依赖，是否可以？[ 1 -> 2 -> 3 -> 4; 1 -> 4; ]。只判断最后操作的节点 1 的出度，和深度遍历 1 的出度的出度，是否有重合
*/

import React, { Component } from "react";
import PropTypes from "prop-types";
import { jsPlumb } from "jsplumb";
import _ from "lodash";

const baseColor = "gray";
const hoverBaseColor = "orange";
// 编排器组件的初始化样式
const defaultJsPlumbSettings = {
  Connector: [
    "Flowchart", // 连线的类型，流程图 Flowchart、贝塞尔曲线 Bezier 等
    {
      alwaysRespectStubs: true,
      cornerRadius: 20,
      midpoint: 0.2,
      stub: [10, 15]
    }
  ],
  DragOptions: {
    cursor: "pointer",
    zIndex: 2000
  },
  PaintStyle: {
    stroke: baseColor,
    strokeStyle: baseColor,
    lineWidth: 2,
    radius: 5
  },
  EndpointStyle: {
    radius: 5,
    fill: baseColor,
    fillStyle: baseColor
  },
  HoverPaintStyle: {
    stroke: hoverBaseColor,
    strokeStyle: hoverBaseColor
  },
  EndpointHoverStyle: {
    fill: hoverBaseColor,
    fillStyle: hoverBaseColor
  },
  ConnectionOverlays: [
    // 箭头样式
    [
      "Arrow",
      {
        location: 1
      },
      {
        foldback: 0.5,
        fill: baseColor,
        fillStyle: baseColor,
        width: 14
      }
    ]
  ]
};
class DragGraph extends Component {
  static defaultProps = {
    graphId: "js_plumb_box_container_id" // 图容器 dom 的 id
  };
  constructor(props) {
    super(props);
    const { edges = [], nodes = [] } = _.get(props, "data", {});
    this.state = {
      edges,
      nodes,
      jsPlumbInstance: null,
      isJsPlumbInstanceCreated: false,
      dragging: false, // 是否触发画布拖动
      nodeDragging: false, // 是否触发node拖动
      _ratio: 0.25, // 滚轮的比率
      _scale: 1, // 画布缩放比例
      _left: 0, // 画布Left位置
      _top: 0, // 画布Top位置
      _initX: 0, // 拖动按下鼠标时的X位置
      _initY: 0 // 拖动按下鼠标时的Y位置
    };
  }

  componentDidMount() {
    jsPlumb.ready(() => {
      const { graphId } = this.props;
      const jsPlumbInstance = jsPlumb.getInstance({
        ...defaultJsPlumbSettings,
        ...this.props.jsPlumbSettings
      });
      jsPlumbInstance.setContainer(document.getElementById(graphId));
      jsPlumbInstance.bind("connection", this.onConnection);
      jsPlumbInstance.bind("contextmenu", this.onDelConnection);
      jsPlumbInstance.bind("connectionDetached", this.onDelConnection);
      this.setEventListeners(jsPlumbInstance);
      // 画点，画线
      this.drawPoint(jsPlumbInstance);
      this.drawLine(jsPlumbInstance);

      this.setState({
        isJsPlumbInstanceCreated: true,
        jsPlumbInstance
      });
    });
  }

  componentDidUpdate(preProps, preState) {
    // 通知父组件图的状态
    if (!_.isEqual(preState, this.state)) {
      const { edges = [], nodes = [] } = this.state;
      this.props.onChange && this.props.onChange({ edges, nodes });
    }
  }
  componentWillReceiveProps(nextProps) {
    // 将最新传进来的节点重新画
    if (!_.isEqual(this.props.data, nextProps.data)) {
      this.setState({ ...nextProps.data }, () => {
        this.drawPoint(this.state.jsPlumbInstance);
      });
    }
  }

  drawPoint(jsPlumbInstance) {
    //画点: 每个节点四个锚点
    let nodes = this.state.nodes;
    for (let i = 0; i < nodes.length; i++) {
      let nUUID = nodes[i].id;
      ["RightMiddle", "LeftMiddle", "TopCenter", "BottomCenter"].forEach(v => {
        jsPlumbInstance.addEndpoint(
          nUUID,
          {
            isTarget: true,
            isSource: true
          },
          {
            uuid: nUUID + v,
            anchor: v,
            maxConnections: -1
          }
        );
      });
      jsPlumbInstance.draggable(nUUID);
    }
  }
  drawLine = jsPlumbInstance => {
    //画线：初始化时，节点连线统一从下出，从上入
    let edges = this.state.edges;
    for (let j = 0; j < edges.length; j++) {
      let connection = jsPlumbInstance.connect({
        uuids: [
          edges[j].sourceId + "BottomCenter",
          edges[j].targetId + "TopCenter"
        ]
      });
      connection.setPaintStyle({
        stroke: "#8b91a0",
        strokeStyle: "#8b91a0"
      });
    }
  };

  // 绑定父组件传入的事件
  setEventListeners = jsPlumbInstance => {
    const eventListeners = this.props.eventListeners;
    if (
      eventListeners &&
      typeof eventListeners === "object" &&
      typeof eventListeners.length === "number"
    ) {
      Object.keys(eventListeners).forEach(event => {
        if (typeof eventListeners[event] !== "undefined") {
          jsPlumbInstance.bind(event, eventListeners[event]);
        }
      });
    }
  };

  // 连线事件
  onConnection = (connObj, originalEvent) => {
    if (!originalEvent) {
      return;
    }
    connObj.connection.setPaintStyle({
      stroke: "#8b91a0",
      strokeStyle: "#8b91a0"
    });
    let sourceId = connObj.sourceId;
    let targetId = connObj.targetId;
    this.setState({
      edges: [
        ...this.state.edges,
        {
          sourceId: sourceId,
          targetId: targetId
        }
      ]
    });
    return false;
  };

  // 删线事件
  onDelConnection = (connObj, originalEvent) => {
    if (!originalEvent) {
      return;
    }
    this.removeConnection(connObj);
    return false;
  };

  // 删除连接线
  removeConnection = connection => {
    this.setState({
      edges: this.state.edges.filter(
        conn =>
          !(
            conn.sourceId === connection.sourceId &&
            conn.targetId === connection.targetId
          )
      )
    });
  };

  // 缩放画布
  onCanvasMousewheel = e => {
    let self = this.state;
    //放大
    if (e.deltaY < 0) {
      this.setState({
        _scale: self._scale + self._scale * self._ratio
      });
    }
    //缩小
    if (e.deltaY > 0) {
      this.setState({
        _scale: self._scale - self._scale * self._ratio
      });
    }
  };

  // node move
  onMouseMove = e => {
    if (!this.state.nodeDragging) {
      this.setState({
        nodeDragging: true
      });
    }
  };

  // 拖动画布
  onCanvasMousedown = e => {
    this.setState({
      _initX: e.pageX,
      _initY: e.pageY,
      dragging: true
    });
  };

  // 拖动节点后重新计算坐标
  upDateNode = options => {
    const { graphId } = this.props;
    let nodesDom = this.refs[graphId].querySelectorAll(".gui-canvas-node");
    if (options) {
      this.refs[graphId].style.left = "0px";
      this.refs[graphId].style.top = "0px";
    }
    options = options || {};
    this.setState({
      ...options,
      nodeDragging: false,
      nodes: this.state.nodes.map(el => {
        for (let i = 0, l = nodesDom.length; i < l; i++) {
          let nodeDom = nodesDom[i];
          if (nodeDom.id === el.id) {
            el.style = {
              top: nodeDom.style.top,
              left: nodeDom.style.left
            };
            break;
          }
        }
        return el;
      })
    });
  };

  // 释放画布
  onCanvasMouseUpLeave = e => {
    const self = this.state;
    const { graphId } = this.props;

    if (self.dragging) {
      const _left = self._left + e.pageX - self._initX;
      const _top = self._top + e.pageY - self._initY;

      this.refs[graphId].style.left = _left + "px";
      this.refs[graphId].style.top = _top + "px";
      this.setState({
        _left,
        _top,
        nodeDragging: false,
        dragging: false
      });
    } else if (self.nodeDragging) {
      // node 的onMouseDown事件被阻止
      this.upDateNode();
    }
  };

  // 移动画布
  onCanvasMousemove = e => {
    const { graphId } = this.props;
    const self = this.state;
    if (!self.dragging) {
      return;
    }
    this.refs[graphId].style.left = self._left + e.pageX - self._initX + "px";
    this.refs[graphId].style.top = self._top + e.pageY - self._initY + "px";
  };

  render() {
    const { graphId } = this.props;
    const nodesDom = this.state.nodes.map(node => {
      const style = node.style || {};

      return (
        <div
          className="gui-canvas-node"
          onMouseMove={this.onMouseMove}
          key={node.id}
          style={style}
          id={node.id}
        >
          <div className="node-cnt">
            <h3 className="node-title">{node.name}</h3>
          </div>
        </div>
      );
    });

    let translateWidth =
      (document.documentElement.clientWidth * (1 - this.state._scale)) / 2;
    let translateHeight =
      ((document.documentElement.clientHeight - 60) * (1 - this.state._scale)) /
      2;

    return (
      <div
        key={graphId}
        className="jsplumb-box"
        onWheel={this.onCanvasMousewheel}
        onMouseMove={this.onCanvasMousemove}
        onMouseDown={this.onCanvasMousedown}
        onMouseUp={this.onCanvasMouseUpLeave}
        onMouseLeave={this.onCanvasMouseUpLeave}
        onContextMenu={event => {
          // 不展示浏览器默认菜单键
          event.stopPropagation();
          event.preventDefault();
        }}
      >
        <div
          className="jsplumb-canvas"
          ref={graphId}
          id={graphId}
          style={{
            transformOrigin: "0px 0px 0px",
            transform: `translate(${translateWidth}px, ${translateHeight}px) scale(${
              this.state._scale
            })`
          }}
        >
          {nodesDom}
        </div>
      </div>
    );
  }
}

DragGraph.propTypes = {
  jsPlumbSettings: PropTypes.object, // 图组件的初始化样式
  data: PropTypes.object.isRequired, // 图数据，data.nodes 是节点，data.edges 是边
  onChange: PropTypes.func, // 将图新状态通知父组件
  graphId: PropTypes.string.isRequired // 图组件 dom 的 id
};
export default DragGraph;
