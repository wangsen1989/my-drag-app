import React from "react";
import PropTypes from "prop-types";
import joint from "jointjs";
import _ from "lodash";
import style from "./index.less";

const adjacencyList = {
  "dddddddddddnan element": ["b", "c"],
  b: ["f"],
  c: ["e", "d"],
  d: [],
  e: [],
  f: ["g"],
  g: [],
  gc: [],
};

export default class AutoSortGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = { adjacencyList };
  }
  componentDidMount() {
    this.graph = new joint.dia.Graph();
    new joint.dia.Paper({
      el: document.querySelector("#auto-sort-graph"),
      width: "100%",
      height: "100%",
      gridSize: 1,
      model: this.graph
    });
    this.drawGrapg(adjacencyList);
  }

  drawGrapg = adjacencyList => {
    const cells = this.buildGraphFromAdjacencyList(adjacencyList);
    this.graph.resetCells(cells);
    joint.layout.DirectedGraph.layout(this.graph, {
      rankDir: "LR",
      marginX: 10,
      marginY: 10
    });
    const nodes = _.filter(
      cells,
      cell => _.get(cell, "attributes.type") === "basic.Rect"
    );
    _.forEach(nodes, node => {
      // 在 svg 中插入 p 标签
      const p = document.createElement("p");
      p.innerHTML = node.id || "";
      document.querySelector(`[model-id='${node.id}'] foreignObject`).append(p);
    });
  };

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

  makeLink = (parentElementLabel, childElementLabel) => {
    return new joint.dia.Link({
      source: { id: parentElementLabel, port: "pRight" },
      target: { id: childElementLabel, port: "pLeft" },
      attrs: { ".marker-target": { d: "M 4 0 L 0 2 L 4 4 z" } },
      smooth: true
    });
  };

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
      ],
      ports: {
        //锚点自定义组，位置和数量
        groups: { p: { position: "absolute" } },
        //每个节点 2 个锚点
        items: [
          {
            id: "pRight",
            group: "p",
            args: { x: "100%", y: "100%" }
          },
          {
            id: "pLeft",
            group: "p",
            args: { x: 0, y: "100%" }
          }
        ]
      }
    });
    return cell;
  };

  render() {
    return <div className={style.autoSortGraph} id="auto-sort-graph" />;
  }
}

AutoSortGraph.propTypes = {
  data: PropTypes.object
};
