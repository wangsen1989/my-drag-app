import React from "react";
import PropTypes from "prop-types";
import joint from "jointjs";
import _ from "lodash";
import style from "./index.less";

const adjacencyList = {
  "This is\nan element": ["b", "c"],
  b: ["f"],
  c: ["e", "d"],
  d: [],
  e: [],
  f: ["g"],
  g: []
};

export default class AutoSortGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = { adjacencyList };
  }
  componentDidMount() {
    const graph = new joint.dia.Graph();
    new joint.dia.Paper({
      el: document.querySelector("#auto-sort-graph"),
      width: 600,
      height: 300,
      gridSize: 1,
      model: graph
    });
    const cells = this.buildGraphFromAdjacencyList(adjacencyList);
    graph.resetCells(cells);
    joint.layout.DirectedGraph.layout(graph, { setLinkVertices: false });
  }

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
      source: { id: parentElementLabel },
      target: { id: childElementLabel },
      attrs: { ".marker-target": { d: "M 4 0 L 0 2 L 4 4 z" } },
      smooth: true
    });
  };

  makeElement = label => {
    const maxLineLength = _.max(label.split("\n"), function(l) {
      return l.length;
    }).length;

    // Compute width/height of the rectangle based on the number
    // of lines in the label and the letter size. 0.6 * letterSize is
    // an approximation of the monospace font letter width.
    const letterSize = 8;
    const width = 2 * (letterSize * (0.6 * maxLineLength + 1));
    const height = 2 * ((label.split("\n").length + 1) * letterSize);

    return new joint.shapes.basic.Rect({
      id: label,
      size: { width: width, height: height },
      attrs: {
        text: {
          text: label,
          "font-size": letterSize,
          "font-family": "monospace"
        },
        rect: {
          width: width,
          height: height,
          rx: 5,
          ry: 5,
          stroke: "#555"
        }
      }
    });
  };

  render() {
    return (
      <div className={style.autoSortGraph} id="auto-sort-graph">
        cd
      </div>
    );
  }
}

AutoSortGraph.propTypes = {
  data: PropTypes.object
};
