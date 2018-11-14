import React from "react";
import joint from "jointjs";
import _ from "lodash";
import { nodeComponent, defaultLinkCfg, paperCgf } from "./joint.config";
import "./joint.min.less";

class DragGraphJoint extends React.Component {
  constructor(props) {
    super(props);
    const { edges = [], nodes = [] } = _.get(props, "data", {});
    this.state = {
      edges,
      nodes
    };
    //把 node.id 和 画节点生成的 cell.id 映射，因为画线时只识别 cell.id
    this.nodeMapToCell = {};
  }

  componentDidMount() {
    const { nodes, edges } = this.state;
    // 初始化数据模型
    this.graph = new joint.dia.Graph();
    // 初始化画布
    this.paper = new joint.dia.Paper(paperCgf(this));
    this.listenPaper(this.paper);
    // 画节点
    this.drawNodes(nodes);
    // 画边
    this.drawEdges(edges);
  }

  // 画所有传进来的节点。此后用户外部再传节点，再在 componentWillReceiveProps 单独画那一个节点
  drawNodes = nodes => {
    _.forEach(nodes, node => {
      const {
        id,
        name,
        style: { left, top }
      } = node;

      // 按照模板自定义每个节点的位置， 信息
      const cell = nodeComponent
        .clone()
        .position(Number(left), Number(top))
        .attr("label/text", name);

      // 图中加入节点
      this.graph.addCell(cell);

      // 把 node.id 和 画节点生成的 cell.id 映射
      this.nodeMapToCell[id] = cell.id;
    });
  };

  // 画所有外部传进来的边。此后用户手动连线不用处理，框架会自己同步数据和视图
  drawEdges = edges => {
    _.forEach(edges, edge => {
      // 定义一种边
      const link = new joint.dia.Link({
        source: { id: this.nodeMapToCell[edge.sourceId], port: "pBottom" },
        target: { id: this.nodeMapToCell[edge.targetId], port: "pTop" },
        ...defaultLinkCfg
      });

      // 图中加入边
      this.graph.addCell(link);
    });
  };

  listenPaper(paper) {
    // 点击节点显示删除节点按钮
    paper.on("cell:pointerclick", cell => {
      cell.el.classList.add("delete-cell-show");
      this.CurrentclickCell = cell.el;
    });
    // 点击空白处不显示删除节点按钮
    paper.on("blank:pointerclick", () => {
      this.CurrentclickCell &&
        this.CurrentclickCell.classList.remove("delete-cell-show");
    });
    // 点删除节点按钮提示用户
    paper.on("element:delete", function(elementView, evt) {
      evt.stopPropagation();
      if (window.confirm("确定要把该节点移到左侧无依赖区吗?")) {
        elementView.model.remove();
        console.log(elementView.model);
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    // 外部新传进来节点，只需再画最新传进来的那一个节点
    if (!_.isEqual(this.props.data, nextProps.data)) {
      this.drawNodes(
        _.difference(
          _.get(nextProps, "data.nodes"),
          _.get(this.props, "data.nodes")
        )
      );
    }
    // TODO: 外部删除节点和边
  }

  render() {
    return <div id="placeholder" />;
  }
}

export default DragGraphJoint;
