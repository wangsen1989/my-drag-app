import joint from "jointjs";

const baseBlue = "#72a5ff";

// node 节点模板
export const nodeComponent = new joint.shapes.standard.Rectangle({
  position: { x: 0, y: 0 }, // 位置信息
  size: { width: 129, height: 38 }, // 大小
  // 自定义矩形节点内部元素
  markup: [
    {
      // 矩形
      tagName: "rect",
      selector: "body"
    },
    {
      // 内部文字
      tagName: "text",
      selector: "label"
    },
    {
      // 右上角删除按钮
      tagName: "circle",
      selector: "delete"
    },
    {
      // 按钮里的图标
      tagName: "path",
      selector: "x"
    }
  ],
  // 自定义矩形节点内部元素的属性，键和 markup 里的 selector 对应
  attrs: {
    body: {
      fill: "#617aa9",
      stroke: "#000",
      "stroke-width": 0,
      rx: 5,
      ty: 5
    },

    label: {
      // 内部文字
      pointeEvents: "none",
      text: "",
      fill: "#fff",
      class: "rect-text" // 自定义的 class
    },
    delete: {
      r: 6,
      fill: "#f05c2b",
      refX: "100%",
      cy: 4,
      cx: -4,
      event: "element:delete", // 右上角删除按钮添加点击事件
      cursor: "pointer",
      transform: "translate(7.5,-7) scale(1)",
      class: "joint-delete-circle"
    },
    x: {
      refX: "100%",
      d:
        "M -3.5 0.7, -3.5 -0.7, -0.7 -0.7, -0.7 -3.5, 0.7 -3.5, 0.7 -0.7 ,3.5 -0.7, 3.5 0.7, 0.7 0.7, 0.7 3.5, -0.7 3.5,-0.7 0.7 z",
      transform: "translate(3.5,-2.8) rotate(45deg) scale(1.3)",
      pointerEvents: "none",
      class: "joint-delete-x"
    }
  },
  //自定义节点四周的锚点
  portMarkup: [
    {
      tagName: "circle",
      selector: "portBody",
      attributes: {
        r: 5, // 锚点半径
        fill: "none", // 锚点填充
        "stroke-width": 1, // 锚点外层圈半径，hover上去会变为 5，太小了鼠标选不上
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

    model: that.graph, // 绑定数据模型 model
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
