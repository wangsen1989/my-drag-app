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
  }

  componentDidMount() {
    const { nodes, edges } = this.state;
    // 初始化数据模型
    this.graph = new joint.dia.Graph();
    // 初始化画布
    this.paper = new joint.dia.Paper(paperCgf(this));
    // 画节点
    this.drawNodes(nodes);
    // 画边
    this.drawEdges(edges);
  }

  // 画节点
  drawNodes = nodes => {
    this.nodeMapToCell = {};
    _.forEach(nodes, node => {
      const {
        id,
        name,
        style: { left, top }
      } = node;
      // 按照模板自定义每个节点的位置， 信息
      const cell = nodeComponent
        .clone()
        .position(parseInt(left), parseInt(top))
        .attr("label/text", name);
      // 图中加入节点
      this.graph.addCell(cell);
      // 把 node.id 和 cell.id 映射，因为画线时只识别 cell.id
      this.nodeMapToCell[id] = cell.id;
    });
  };

  // 画边
  drawEdges = edges => {
    _.forEach(edges, edge => {
      // 定义一种边
      const link = new joint.dia.Link({
        source: { id: this.nodeMapToCell[edge.sourceId], port: "pBottom" },
        target: { id: this.nodeMapToCell[edge.targetId], port: "pTop" },
        ...defaultLinkCfg
      });

      // 图中加入线
      this.graph.addCell(link);
    });
  };

  render() {
    return <div id="placeholder" />;
  }
}

export default DragGraphJoint;
