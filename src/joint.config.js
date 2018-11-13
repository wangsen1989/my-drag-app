import joint from "jointjs";

const baseBlue = "#72a5ff";

// node 节点模板
export const nodeComponent = new joint.shapes.standard.Rectangle({
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
      class: "rect-text" // 自定义的 class
    }
  }
});

// 默认连线样式配置
export const defaultLinkCfg = {
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

// 自定义连线上的事件和小工具
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

// 画布配置
export const paperCgf = that => {
  return {
    el: document.getElementById("placeholder"),
    width: "100%",
    height: "100%",
    gridSize: 1,

    model: that.graph, // 数据模型
    defaultLink: new joint.dia.Link(defaultLinkCfg), // 定义一种边，含默认连接线样式
    interactive: { vertexAdd: false }, // 禁止点击连线多出节点
    linkView: CustomLinkView, // 自定义连线上的事件和小工具
    snapLinks: { radius: 20 }, // 近距离自动粘附
    linkPinning: false, // false，连线必须链接到节点才有效；true 会允许悬空
    // 锚点被接触时周围高亮
    highlighting: {
      default: {
        name: "stroke",
        options: {
          padding: 5
        }
      }
    },

    // 提供校验接口
    validateConnection: (
      cellViewS, //来源节点
      magnetS,
      cellViewT, //目标节点
      magnetT,
      end,
      linkView
    ) => {
      const edges = that.graph.getLinks(); //获取所有边
      const nodes = that.graph.getElements(); //获取所有节点
      const { validateConnection } = that.props;

      let validate = true;
      if (validateConnection) {
        validate = validateConnection(nodes, edges, cellViewS, cellViewT);
        validate = validate === undefined ? true : validate;
      }

      return validate;
    }
  };
};
