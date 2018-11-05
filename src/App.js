import React, { Component } from "react";
import PropTypes from "prop-types";
import { jsPlumb } from "jsplumb";
import _ from "lodash";

const JSPLUMB_ID = "jsplumb_box";
const color = "gray";

class DragGraph extends Component {
  static defaultProps = {
    // 编排器组件的初始化样式
    jsPlumbSettings: {
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
        stroke: color,
        strokeStyle: color,
        lineWidth: 2,
        radius: 5
      },
      EndpointStyle: {
        radius: 5,
        fill: color,
        fillStyle: color
      },
      HoverPaintStyle: {
        stroke: "#ec9f2e",
        strokeStyle: "#ec9f2e"
      },
      EndpointHoverStyle: {
        fill: "#ec9f2e",
        fillStyle: "#ec9f2e"
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
            fill: color,
            fillStyle: color,
            width: 14
          }
        ]
      ]
    }
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
      const jsPlumbInstance = jsPlumb.getInstance(this.props.jsPlumbSettings);
      jsPlumbInstance.setContainer(document.getElementById(JSPLUMB_ID));
      jsPlumbInstance.bind("connection", this.onConnection);
      jsPlumbInstance.bind("contextmenu", this.onDelConnection);
      jsPlumbInstance.bind("connectionDetached", this.onDelConnection);
      this.setEventListeners(jsPlumbInstance);

      let anSourceEndpoint = {
        isSource: true
        // Anchor: ["TopCenter"], // 入锚点
      };
      let anTargetEndpoint = {
        isTarget: true
        // Anchor: ["BottomCenter"], // 出锚点
      };

      //画点
      let nodes = this.state.nodes;
      for (let i = 0; i < nodes.length; i++) {
        let nUUID = nodes[i].id;
        jsPlumbInstance.addEndpoint(nUUID, anSourceEndpoint, {
          uuid: nUUID + "-bottom",
          anchor: "Bottom",
          maxConnections: -1
        });
        jsPlumbInstance.addEndpoint(nUUID, anTargetEndpoint, {
          uuid: nUUID + "-top",
          anchor: "Top",
          maxConnections: -1
        });
        jsPlumbInstance.draggable(nUUID);
      }

      //画线
      let edges = this.state.edges;
      for (let j = 0; j < edges.length; j++) {
        let connection = jsPlumbInstance.connect({
          uuids: [edges[j].sourceId + "-bottom", edges[j].targetId + "-top"]
        });
        connection.setPaintStyle({
          stroke: "#8b91a0",
          strokeStyle: "#8b91a0"
        });
      }

      this.setState({
        isJsPlumbInstanceCreated: true,
        jsPlumbInstance
      });
    });
  }

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
    this.updateParent();
  };

  // 更新父组件状态
  updateParent = () => {
    if (this.props.onChange) {
      this.props.onChange({
        edges: this.state.edges,
        nodes: this.state.nodes
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
    let nodesDom = this.refs[JSPLUMB_ID].querySelectorAll(".gui-canvas-node");
    if (options) {
      this.refs[JSPLUMB_ID].style.left = "0px";
      this.refs[JSPLUMB_ID].style.top = "0px";
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
    let self = this.state;

    if (self.dragging) {
      let _left = self._left + e.pageX - self._initX;
      let _top = self._top + e.pageY - self._initY;

      this.refs[JSPLUMB_ID].style.left = _left + "px";
      this.refs[JSPLUMB_ID].style.top = _top + "px";
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
    let self = this.state;
    if (!self.dragging) {
      return;
    }
    this.refs[JSPLUMB_ID].style.left =
      self._left + e.pageX - self._initX + "px";
    this.refs[JSPLUMB_ID].style.top = self._top + e.pageY - self._initY + "px";
  };

  render() {
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
      <div className="App">
        <div
          key={JSPLUMB_ID}
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
            ref={JSPLUMB_ID}
            id={JSPLUMB_ID}
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
      </div>
    );
  }
}

DragGraph.propTypes = {
  jsPlumbSettings: PropTypes.object, // 编排器组件的初始化样式
  data: PropTypes.object, // 图数据，data.node 是节点，data.edges 是边
};
export default DragGraph;
