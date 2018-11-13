import React from "react";
import ReactDOM from "react-dom";
import joint from "jointjs";
import _ from "lodash";
import "./joint.min.css";

const baseBlue = "#72a5ff";

// node 节点模板
const nodeComponent = new joint.shapes.standard.Rectangle({
  position: { x: 0, y: 0 }, //位置信息
  size: { width: 129, height: 38 }, //大小
  portMarkup: [
    {
      //锚点样式
      tagName: "circle",
      selector: "portBody",
      attributes: {
        fill: "#9a9aae",
        stroke: baseBlue,
        r: 5 // 太小了就只能链接一根线
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
          portBody: { fill: "#9a9aae", magnet: true }
        }
      }
    },
    //每个节点 4 个锚点
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
  //   矩形节点样式
  attrs: {
    root: { magnet: false }, //root 部位?
    body: { fill: "#617aa9", "stroke-width": 0 }, //矩形实体填充
    label: {
      //内部文字
      pointeEvents: "none",
      text: "",
      fill: "#fff"
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

    // 定义一种边，含默认连接线样式
    const link = new joint.dia.Link({
      connector: { name: "rounded" }, // 连接线路径风格 https://resources.jointjs.com/demos/routing
      router: { name: "manhattan" }, // 连接线路径风格
      attrs: {
        // 连接线样式
        ".connection": {
          stroke: baseBlue,
          "stroke-width": 2
        },
        ".marker-target": {
          // 连接线箭头样式
          fill: baseBlue,
          "stroke-width": 0,
          d: "M 10 0 L 0 5 L 10 10 z"
        }
      }
    });

    // 初始化画布
    this.paper = new joint.dia.Paper({
      el: ReactDOM.findDOMNode(this.refs.placeholder),
      width: "100%",
      height: "100%",
      gridSize: 1,
      model: this.graph,
      defaultLink: link
    });

    let { nodes, edges } = this.state;
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
        connector: { name: "rounded" }, // 连接线路径风格
        router: { name: "manhattan" }, // 连接线路径风格
        attrs: {
          // 连接线样式
          ".connection": {
            stroke: baseBlue,
            "stroke-width": 2
          },
          ".marker-target": {
            // 连接线箭头样式
            fill: baseBlue,
            "stroke-width": 0,
            d: "M 10 0 L 0 5 L 10 10 z"
          }
        }
      });
      // 连接线单击默认会生出一个中间节点，ux 并不需要这样，所以把节点都去掉
      link.on("change:vertices", function(child, vertices) {
        while (vertices.length > 0) {
          vertices.pop();
        }
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
