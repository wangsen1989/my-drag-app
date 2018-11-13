import React from "react";
import ReactDOM from "react-dom";
import joint from "jointjs";
import _ from "lodash";
import "./joint.min.less";

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
        r: 5, // 锚点半径
        fill: "none", // 锚点填充
        "stroke-width": 1, // 锚点外层圈半径，hover上去会变为 3，太小了鼠标选不上
        stroke: baseBlue, // 锚点外层圈填充
        magnet: true // 显示选中十字架套索
      }
    }
  ],
  ports: {
    //锚点自定义组，位置和数量
    groups: { p: { position: "absolute" } },
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
      fill: "#fff",
      class: "rect-text", // 自定义的 class
    }
  }
});

const defaultLinkCfg = {
  connector: { name: "rounded" }, // 连接线路径风格 https://resources.jointjs.com/demos/routing
  router: { name: "manhattan" }, // 连接线路径风格
  attrs: {
    // 连接线样式
    ".connection": {
      stroke: baseBlue,
      "stroke-width": 1
    },
    ".marker-target": {
      // 连接线箭头样式
      fill: baseBlue,
      "stroke-width": 0,
      d: "M 10 0 L 0 5 L 10 10 z"
    }
  }
};
const CustomLinkView = joint.dia.LinkView.extend({
  // 自定义连线的事件:
  // pointerclick: function(evt, x, y) {
  //   this.addVertex(x, y);
  // },
  // 自定义 options:
  options: joint.util.defaults(
    {
      linkToolsOffset: 50
    },
    joint.dia.LinkView.prototype.options
  )
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
    const link = new joint.dia.Link(defaultLinkCfg);

    const that = this; // 实例化 paper 需要用 es5 的 this
    // 初始化画布
    this.paper = new joint.dia.Paper({
      el: ReactDOM.findDOMNode(this.refs.placeholder),
      width: "100%",
      height: "100%",
      gridSize: 1,
      model: this.graph,
      defaultLink: link,
      interactive: { vertexAdd: false }, // 禁止点击连线多出节点
      linkView: CustomLinkView,
      snapLinks: { radius: 20 }, // 近距离自动粘附
      linkPinning: false, // false 连线必须链接到节点才有效
      highlighting: {
        // 锚点被接触时周围高亮
        default: {
          name: "stroke",
          options: {
            padding: 5
          }
        }
      },
      validateConnection: function(
        //提供校验接口
        cellViewS,
        magnetS,
        cellViewT,
        magnetT,
        end,
        linkView
      ) {
        const edges = this.model.getLinks(),
          nodes = this.model.getElements(),
          source = cellViewS,
          target = cellViewT,
          { validateConnection } = that.props;
        let validate = true;
        if (validateConnection) {
          validate = validateConnection(nodes, edges, source, target);
          validate = validate === undefined ? true : validate;
        }
        return validate;
      }
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
        ...defaultLinkCfg
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
