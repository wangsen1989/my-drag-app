import React from "react";
import ReactDOM from "react-dom";
import joint from "jointjs";
import _ from "lodash";
import "./joint.min.css";

// node 节点模板
const nodeComponent = new joint.shapes.standard.Rectangle({
  position: { x: 0, y: 0 }, //位置信息
  size: { width: 120, height: 60 }, //大小
  portMarkup: [
    {
      //锚点样式
      tagName: "circle",
      selector: "portBody",
      attributes: {
        fill: "#ff0000",
        stroke: "#000000",
        r: 10
      }
    }
  ],
  portLabelMarkup: [
    {
      //锚点 label 的样式
      tagName: "text",
      selector: "portLabel",
      attributes: {
        fill: "#ff0000"
      }
    }
  ],
  ports: {
    //锚点自定义组，位置和数量
    groups: {
      p: {
        position: "absolute",
        label: { position: "outside" },
        attrs: {
          portBody: { fill: "white", magnet: true }
        }
      }
    },
    items: [
      {
        id: "pTop",
        group: "p",
        args: { x: "50%", y: 0 }
      },
      {
        id: "pRight",
        group: "p",
        args: { x: "100%", y: "50%" }
      },
      {
        id: "pBottom",
        group: "p",
        args: { x: "50%", y: "100%" }
      },
      {
        id: "pLeft",
        group: "p",
        args: { x: 0, y: "50%" }
      }
    ]
  },
  attrs: {
    root: { magnet: false }, //root 部位
    body: { fill: "blue" }, //矩形实体填充
    label: {
      //内部文字
      pointeEvents: "none",
      text: "",
      refX: 0.5,
      refY: 20,
      textAnchor: "middle",
      fill: "#000000"
    }
  }
});

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
    this.graph = new joint.dia.Graph();
    // 初始化画布
    this.paper = new joint.dia.Paper({
      el: ReactDOM.findDOMNode(this.refs.placeholder),
      width: "100%",
      height: "100%",
      gridSize: 1,
      model: this.graph
    });

    let { nodes, edges } = this.state;
    // 画节点
    this.drawNodes(nodes);
    // 画边
    this.drawEdges(edges);
  }
  drawNodes = nodes => {
    this.edgesIdMap = {};
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
      this.edgesIdMap[id] = cell.id;
    });
  };

  drawEdges = edges => {
    _.forEach(edges, edge => {
      const link = new joint.dia.Link({
        source: { id: this.edgesIdMap[edge.sourceId], port: "pBottom" },
        target: { id: this.edgesIdMap[edge.targetId], port: "pTop" },

      connector: {name: 'rounded'},
      router: { name: 'manhattan' },
      attrs: { // 连接线样式
        ".connection": {
          stroke: "#333333",
          "stroke-width": 3
        },
        ".marker-target": { // 连接线箭头样式
          fill: "#333333",
          d: "M 10 0 L 0 5 L 10 10 z"
        }
      }
    //     router: function(v) {
    //       console.log(arguments);
    //       while (v.length > 0) {
    //         v.pop();
    //       }
    //       return [];
    //     },
      });
      // 图中加入线
      this.graph.addCell(link);
    });
  };
  render() {
    return <div ref="placeholder" />;
  }
}

export default DragGraphJoint;
