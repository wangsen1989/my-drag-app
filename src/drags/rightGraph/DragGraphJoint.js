/* 
    本组件可单独作为一个 svg 拖拽组件使用，
    从父组件接收的数据格式为 data={ nodes: [], edges: [] },
    可传入不同的校验函数来决定数据结构
*/

import React from "react";
import joint from "jointjs";
import _ from "lodash";
import { nodeComponent, defaultLinkCfg, paperCgf } from "./joint.config";
import style from "./joint.less";

class DragGraphJoint extends React.Component {
  constructor(props) {
    super(props);
    const { edges = [], nodes = [] } = _.get(props, "data", {});
    this.state = {
      edges,
      nodes
    };
    //把 node.id 和 画节点生成的 cell.id 映射，因为画线时只识别 cell.id
    this.nodeMapToCells = [];
  }

  componentDidMount() {
    const { nodes, edges } = this.state;
    // 初始化数据模型 model
    this.graph = new joint.dia.Graph();
    // 初始化画布 view， paperCgf 中会把 model view 双向绑定
    this.paper = new joint.dia.Paper(paperCgf(this));
    // 画节点：改变 view 并把数据录入 model
    this.drawNodes(nodes, true);
    // 画边：改变 view 并把数据录入 model
    this.drawEdges(edges);
    // view 画布监听点击事件，处理自定义交互
    this.listenPaper(this.paper);
  }

  // 画所有传进来的节点。此后用户外部再传节点，再在 componentWillReceiveProps 单独画那一个节点
  drawNodes = (nodes, init) => {
    _.forEach(nodes, node => {
      let {
        id,
        name,
        style: { left, top }
      } = node;
      // offsetParent.offsetLeft 取最近的有定位的父元素的 offsetLeft
      const paperLeft = this.paper.$el[0].offsetParent.offsetLeft;
      const paperTop = this.paper.$el[0].offsetParent.offsetTop;
      // 因为 clientToLocalPoint 要的是相对于 client 的坐标，而用户已经保存过的数据不是相对于 client, 而是 paper 内部坐标，所以要加上 paperLeft
      if (init) {
        left += paperLeft;
        top += paperTop;
      }
      // 将普通的相对于 client 坐标转化为 paper 里的坐标
      const { x, y } = this.paper.clientToLocalPoint(left, top);
      const cell = nodeComponent
        .clone()
        .position(x, y)
        // .attr("label/text", name)
        .set("originNodeData", node);

      // 监听节点位置改变
      cell.on("change:position", (element1, position) => {
        this.handleChange();
      });
      // model view 中加入节点
      this.graph.addCell(cell);
      // 在 svg 中插入 p 标签
      const p = document.createElement("p");
      p.innerHTML = name || "";
      document.querySelector(`[model-id='${cell.id}'] foreignObject`).append(p);
      // 把 node.id 和 画节点生成的 cell.id 映射，drawEdges 时找到 node 节点对应的 cell
      this.nodeMapToCells.push({
        nodeId: id,
        cellId: cell.id,
        name
      });
    });
  };

  // 画所有外部传进来的边。此后用户手动连线不用处理，框架会自己同步数据和视图
  drawEdges = edges => {
    _.forEach(edges, edge => {
      const sourceCellId = _.find(
        this.nodeMapToCells,
        nMapC => nMapC.nodeId === edge.sourceId
      ).cellId;
      const targetCellId = _.find(
        this.nodeMapToCells,
        nMapC => nMapC.nodeId === edge.targetId
      ).cellId;
      // 定义初次加载时的边
      const link = new joint.dia.Link({
        source: { id: sourceCellId, port: "pBottom" },
        target: { id: targetCellId, port: "pTop" },
        ...defaultLinkCfg
      });
      link.connector('rounded', {
        radius: 2
    });
      // 监听边的删除并传出去, 连自己和连线取消事件也会触发 remove
      link.on("remove", linkView => {
        const { source: { id } = {}, target: { id: _id } = {} } = _.get(
          linkView,
          "attributes",
          {}
        );
        if (_id && id !== _id) {
          // remove 后，数据没有马上变化，所以过滤一下
          let links = this.graph.getLinks(); //获取所有边
          links = _.filter(links, link => link.id !== linkView.id);
          this.handleChange({ links });
        }
      });

      // model view 中加入边
      this.graph.addCell(link);
    });
  };

  listenPaper(paper) {
    // 点击垃圾箱显示删除节点按钮
    paper.on("cell:pointerclick", (cell, e, x, y) => {
      const clickClass = [...e.target.classList];
      if (clickClass.includes("rubbish-rect")) {
        // 垃圾桶
        this.clickedCell &&
          this.clickedCell.classList.remove("delete-cell-show");
        cell.el.classList.add("delete-cell-show");
        this.clickedCell = cell.el;
      } else if (clickClass.includes("delete-cancle-button")) {
        // 取消删除
        this.clickedCell &&
          this.clickedCell.classList.remove("delete-cell-show");
      }
    });
    // 点击空白处不显示删除节点按钮
    paper.on("blank:pointerclick", () => {
      this.clickedCell && this.clickedCell.classList.remove("delete-cell-show");
    });
    // 点删除节点按钮
    paper.on("element:delete", (elementView, evt) => {
      evt.stopPropagation();
      elementView.model.remove();
      this.nodeMapToCells = _.filter(
        this.nodeMapToCells,
        nMapC => nMapC.cellId !== elementView.model.id
      );
      this.handleChange();
    });
    // 监听连线成功事件
    paper.on("link:connect", (...rest) => {
      this.handleChange();
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.data, nextProps.data)) {
      const thisNodeIds = _.map(this.props.data.nodes, node => node.id);
      const nextNodeIds = _.map(nextProps.data.nodes, node => node.id);
      // 外部新传进来节点，只需再画最新传进来的那一个节点
      if (nextNodeIds.length > thisNodeIds.length) {
        const justAddNode = _.filter(
          nextProps.data.nodes,
          node => node.id === _.difference(nextNodeIds, thisNodeIds)[0]
        );
        !_.isEmpty(justAddNode) && this.drawNodes(justAddNode);
      }
      if (nextNodeIds.length < thisNodeIds.length) {
        // 外部删除节点，删除模型里节点信息；内部删除也会走进这里
        const justDeleteCellId = _.get(
          _.find(
            this.nodeMapToCells,
            nMapC => nMapC.nodeId === _.difference(thisNodeIds, nextNodeIds)[0]
          ),
          "cellId"
        );
        // 内部删除也会走进这里，只是到这里时 justDeleteCell 已经被删除，就不走下面的流程了
        if (justDeleteCellId) {
          const justDeleteCell = _.find(
            this.graph.getElements(),
            cell => cell.id === justDeleteCellId
          );
          if (justDeleteCell) {
            justDeleteCell.remove();
            this.nodeMapToCells = _.filter(
              this.nodeMapToCells,
              nMapC => nMapC.cellId !== justDeleteCellId
            );
          }
        }
      }
    }
  }

  handleChange = ({ links: _links } = {}) => {
    const links = _links || this.graph.getLinks(); //获取所有边
    const cells = this.graph.getElements(); //获取所有节点

    const nodes = _.map(cells, cell => {
      const {
        originNodeData: { id, name },
        position: { x: left, y: top }
      } = _.get(cell, "attributes");
      return {
        id,
        name,
        style: { left, top }
      };
    });

    const edges = _.map(links, link => {
      const {
        source: { id: sourceCellId } = {},
        target: { id: targetCellId } = {}
      } = _.get(link, "attributes", {});

      const sourceNodeId = _.find(
        this.nodeMapToCells,
        nMapC => nMapC.cellId === sourceCellId
      ).nodeId;
      const targetNodeId = _.find(
        this.nodeMapToCells,
        nMapC => nMapC.cellId === targetCellId
      ).nodeId;

      return { sourceId: sourceNodeId, targetId: targetNodeId };
    });

    const { onChange } = this.props;
    onChange && onChange({ nodes, edges });
  };

  // 缩放画布 最大最小一倍
  onCanvasMousewheel = e => {
    let { sx = 1, sy = 1 } = this.paper.scale();
    const step = 0.2; // 步长

    //放大
    if (e.deltaY < 0) {
      sx = sx + sx * step > 2 ? 2 : sx + sx * step;
    }
    //缩小
    if (e.deltaY > 0) {
      sx = sx - sx * step < 0.5 ? 0.5 : sx - sx * step;
    }
    sy = sx;

    this.paper.scale(sx, sy);
  };

  // 拖动画布
  onCanvasMousedown = e => {
    // 拖动区分节点和画布
    if (e.target.tagName !== "svg") return;
    this.dragging = true;
    this._initX = e.pageX;
    this._initY = e.pageY;
    e.target.style.cursor = "move";
  };

  // 移动画布
  onCanvasMousemove = e => {
    if (!this.dragging) return;
    const left = e.pageX - this._initX + (this.hadTx || 0);
    const top = e.pageY - this._initY + (this.hadTy || 0);
    this.paper.translate(left, top);
  };

  // 释放画布
  onCanvasMouseUpLeave = e => {
    if (!this.dragging) return;
    this.dragging = false;
    const { tx, ty } = this.paper.translate();
    this.hadTx = tx;
    this.hadTy = ty;
    e.target.style.cursor = "";
  };

  render() {
    return (
      <div
        id="placeholder"
        className={style["joint-paper"]}
        onWheel={this.onCanvasMousewheel}
        onMouseDown={this.onCanvasMousedown}
        onMouseMove={this.onCanvasMousemove}
        onMouseUp={this.onCanvasMouseUpLeave}
        onMouseLeave={this.onCanvasMouseUpLeave}
      />
    );
  }
}

export default DragGraphJoint;
