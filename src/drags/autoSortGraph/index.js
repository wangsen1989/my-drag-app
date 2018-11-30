import React from "react";
import PropTypes from "prop-types";
import joint from "jointjs";
import _ from "lodash";
import style from "./index.less";

export default class AutoSortGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data || {}
    };
    this.graph = new joint.dia.Graph();
  }
  componentDidMount() {
    new joint.dia.Paper({
      el: document.querySelector("#auto-sort-graph"),
      // width: "100%",
      // height: "100%",
      gridSize: 1,
      model: this.graph
    });
    this.drawGraph();
  }

  drawGraph = () => {
    const {
      data: { nodes, edges }
    } = this.state;
    // 将边的信息转为邻接表
    const adjacencyList = this.edgesToAdjacencyList(edges);
    // 将邻接表加工成该库接受的图数据
    const cells = this.buildGraphFromAdjacencyList(adjacencyList);
    // 加入 dom
    this.graph.resetCells(cells);
    // 布局
    joint.layout.DirectedGraph.layout(this.graph, {
      rankDir: "LR",
      nodeSep: 5,
      edgeSep: 10,
      rankSep: 50,
      marginX: 10,
      marginY: 10
    });
    // 找出所有节点
    const rects = _.filter(
      cells,
      cell => _.get(cell, "attributes.type") === "basic.Rect"
    );
    // 给节点添加展示名称 name ，而非 id
    _.forEach(rects, rect => {
      // 在 svg 中插入 p 标签
      const p = document.createElement("p");
      const nodeName = _.find(nodes, node => node.id === rect.id).name;
      p.innerHTML = nodeName || "";
      document.querySelector(`[model-id='${rect.id}'] foreignObject`).append(p);
    });
    this.forceUpdate();
  };

  // 将依赖信息转为邻接表
  edgesToAdjacencyList = edges => {
    const adjacencyList = {};
    _.forEach(edges, edge => {
      // 将起点这个节点，和他的依赖，加入邻接表
      if (adjacencyList[edge.sourceId] === undefined) {
        adjacencyList[edge.sourceId] = [edge.targetId];
      } else {
        adjacencyList[edge.sourceId].push([edge.targetId]);
      }
      // 将终点这个节点，加入邻接表
      if (adjacencyList[edge.targetId] === undefined) {
        adjacencyList[edge.targetId] = [];
      }
    });
    return adjacencyList;
  };
  // 将邻接表加工成该库接受的图数据
  buildGraphFromAdjacencyList = adjacencyList => {
    const elements = [];
    const links = [];

    _.each(adjacencyList, (edges, parentElementLabel) => {
      elements.push(this.makeElement(parentElementLabel));

      _.each(edges, childElementLabel => {
        links.push(this.makeLink(parentElementLabel, childElementLabel));
      });
    });
    return elements.concat(links);
  };
  // 画线
  makeLink = (parentElementLabel, childElementLabel) => {
    return new joint.dia.Link({
      source: { id: parentElementLabel, port: "pRight" },
      target: { id: childElementLabel, port: "pLeft" },
      attrs: { ".marker-target": { d: "M 10 0 L 0 5 L 10 10 z" } },
      smooth: true
    });
  };
  // 画节点
  makeElement = label => {
    const cell = new joint.shapes.basic.Rect({
      id: label,
      size: { width: 119, height: 32 },
      // 因为，内部文字要换行，所以不能用 svg 元素，只能在 drawNode 时让 dom append 一个 p 标签
      markup: [
        {
          tagName: "foreignObject",
          selector: "out-box",
          className: "out-box"
        }
      ]
    });
    return cell;
  };

  // 外部变化就刷新
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.data, nextProps.data)) {
      this.setState({ data: nextProps.data }, () => {
        this.drawGraph();
      });
    }
  }

  render() {
    const { width = 0, height = 0 } = this.graph.getBBox() || {};
    const styles = { width: width + 20, height: height + 20 };
    // console.log(styles);
    return (
      <div
        className={style.autoSortGraph}
        style={styles}
        id="auto-sort-graph"
      />
    );
  }
}

AutoSortGraph.propTypes = {
  data: PropTypes.object // 数据格式为 { nodes: [], edges: [] }
};
