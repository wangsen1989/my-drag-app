import joint from "jointjs";
import _ from "lodash";

const baseColor = "#76889C";

// node 节点模板
export const nodeComponent = new joint.shapes.standard.Rectangle({
  position: { x: 0, y: 0 }, // 位置信息
  size: { width: 164, height: 96 }, // 大小
  // 自定义矩形节点内部元素
  markup: [
    {
      tagName: "foreignObject",
      selector: "out-box",
      className: "out-box"
      // 因为文字要换行，不能用 svg 元素， 但这样写却渲染不出来，只能在 drawNode 时让 dom append 一个 p 标签
      // children: [
      //   {
      //     tagName: "p",
      //     textContent: "ccc",
      //   }
      // ]
    },

    {
      // 垃圾桶容器
      tagName: "rect",
      className: "rubbish-rect"
    },
    {
      // 垃圾桶图标
      tagName: "path",
      className: "rubbish"
    },
    {
      // 左下角删除按钮
      tagName: "circle",
      selector: "delete",
      className: "delete-button"
    },
    {
      // 左下角取消删除按钮
      tagName: "circle",
      selector: "delete-cancle",
      className: "delete-cancle-button"
    },
    {
      // 左下角删除按钮文字
      tagName: "text",
      textContent: "确认",
      className: "delete-button-text"
    },
    {
      // 左下角取消删除按钮文字
      tagName: "text",
      textContent: "取消",
      className: "delete-cancle-button-text"
    },
    {
      // 节点四周的 4 个 L 标志
      tagName: "path",
      className: "l-path l-path-left-top"
    },
    {
      // 节点四周的 4 个 L 标志
      tagName: "path",
      className: "l-path l-path-right-top"
    },
    {
      // 节点四周的 4 个 L 标志
      tagName: "path",
      className: "l-path l-path-left-buttom"
    },
    {
      // 节点四周的 4 个 L 标志
      tagName: "path",
      className: "l-path l-path-right-buttom"
    }
  ],
  // 自定义矩形节点内部元素的属性，键和 markup 里的 selector 对应
  attrs: {
    delete: {
      event: "element:delete", // 按钮添加删除事件
      cursor: "pointer"
    }
  },
  //自定义节点四周的锚点
  portMarkup: [
    {
      tagName: "circle",
      attributes: {
        r: 1, // 锚点半径, 去掉会报错
        magnet: true // 显示选中十字架套索
      },
      className: "port-circle"
    },
    {
      tagName: "path",
      className: "port-path"
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
  // connector: { name: "rounded", radius: 2 }, // 此处设置 radius 未生效，连接线路径风格 https://resources.jointjs.com/demos/routing
  router: { name: "manhattan" }, // 连接线路径风格
  attrs: {
    // 连接线样式
    ".connection": {
      stroke: baseColor,
      "stroke-width": 1
    },
    ".marker-target": {
      // 连接线箭头样式
      fill: baseColor,
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
      linkToolsOffset: 50,
      shortLinkLength: 10
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
    // 定义当用户自己拖拽时的默认边
    defaultLink: function(cellView) {
      const link = new joint.dia.Link(defaultLinkCfg);
      link.connector("rounded", {
        radius: 2
      });
      // 监听边的删除并传出去, 连自己和连线取消事件也会触发 remove
      link.on("remove", linkView => {
        const { source: { id } = {}, target: { id: _id } = {} } = _.get(
          linkView,
          "attributes",
          {}
        );
        if (_id && id !== _id) {
          // remove 后，数据没有马上变化，所以过滤一下
          let links = that.graph.getLinks(); //获取所有边
          links = _.filter(links, link => link.id !== linkView.id);
          that.handleChange({ links });
        }
      });

      return link;
    },
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
      const { validateConnection } = that.props;
      let validate = true;
      if (validateConnection) {
        validate = validateConnection(cellViewS, cellViewT);
        validate = validate === undefined ? true : validate;
      }

      const { magnetT: _magnetT } =
        that.validateFails || {};

      // 校验正常，去掉上次错误的端口样式
      if (validate === undefined || validate) {
        _magnetT && _magnetT.classList.remove("validate-fail");
      }

      // 校验出错 && 不是自己链接自己的那种, 自己链接自己就不用爆红了
      if (validate === false && cellViewS !== cellViewT) {
        // 去掉上次错误的端口样式
        if (magnetT !== _magnetT) {
          _magnetT && _magnetT.classList.remove("validate-fail");
        }
        // 给这次错误的端口加样式
        magnetT && magnetT.classList.add("validate-fail");
        // 更新错误链接数据
        that.validateFails = {
          magnetT,
          linkView
        };
      }
      return validate;
    }
  };
};

// index 组件将外部传来的未分组的数据分左右组
export const separate = (data = {}) => {
  const { nodes = [], edges = [] } = data;
  const leftNodes = { nodes: [] }; // 左侧无依赖只有节点
  const rightNodes = { nodes: [], edges }; // 右侧有节点和边
  // 有位置信息的放在右侧，无位置信息的放左侧
  _.forEach(nodes, node => {
    if (_.isEmpty(node.style)) {
      leftNodes.nodes.push(node);
    } else {
      rightNodes.nodes.push(node);
    }
  });
  return { leftNodes, rightNodes };
};

// 校验图的数据结构
export const validateConnectFun = (edges, source, target) => {
  const sourceId = _.get(source, "model.attributes.originNodeData.id");
  const targetId = _.get(target, "model.attributes.originNodeData.id");

  if (sourceId === targetId) {
    // console.log("自己不能连自己");
    return false;
  } else if (_.find(edges, { sourceId, targetId })) {
    // console.log("不能重复链接");
    return false;
  } else {
    // 拿到某节点的继任者
    const getKids = v =>
      edges.filter(edge => edge.sourceId === v).map(edge => edge.targetId);

    //检验当前连线会导致环: 操作 src 去连接 target，而 target 已有继任者是 src
    const hasLoopFun = (src, target) => {
      const hasVisited = []; // 已访问的节点缓存,防止重复访问

      const dfs = vertex => {
        // console.log("开始深度访问节点", vertex);
        const kids = getKids(vertex);
        for (let kid of kids) {
          if (hasVisited.includes(kid)) {
            // console.log(`${kid}已经被缓存过，不需再访问,继续下一轮`);
            continue;
          }
          if (kid === src) {
            // console.log(kid, "处有环, 跳出！!!!!!!");
            return false; // 有环，跳出
          } else if (getKids(kid).length > 0) {
            // 深度遍历继任者
            const noLoop = dfs(kid);
            // 这样就可以同时跳出掉当下的 for 循环和递归函数，并且向上层递归层层传递 false，使上层 for 循环和递归跳出
            if (noLoop === false) return false;
          }
          // vertex 的 kids 里， kid1 访问完毕，在访问下一个同辈 kid2 之前，把 kid1 加到已访问的缓存
          hasVisited.push(kid);
          // console.log("完全被访问完毕的数组", hasVisited);
        }
      };

      const noLoop = dfs(target);
      return noLoop;
    };

    const noLoop = hasLoopFun(sourceId, targetId);
    // console.log("-------------------检测结束-----------------------");
    return noLoop;
  }
};

/* 
全局检测环：拓扑排序
  找出节点中，出度为 0 的节点，因为此点没有出度，故不可能在它身上经过环， 所以删除掉此节点和指向它的边
  继续重复如上删除，如果没有环， 到最后节点会被删干净
  最后如果还存在没有被删除的顶点，说明这几个顶点构成了环 [ 删不完会陷入循环，所以用一个字段代表上次循环时节点的长度，如果和这次相等，说明删不完，跳出 ]
*/
export const toPoValitate = (nodes, edges) => {
  let preNodesLen = nodes.length; // 记录节点数组长度
  let noLoop = true;
  const toPoSort = (nodes, edges) => {
    // 找出节点和它的出度
    let node_outs = _.map(nodes, node => {
      return {
        id: node.id,
        outEdges: _.filter(edges, edge => edge.sourceId === node.id).length
      };
    });
    // 找到出度为 0 的顶点的 ids
    const nodes_no_out_ids = _.map(
      _.filter(node_outs, node_out => node_out.outEdges === 0),
      node => node.id
    );

    // 删除这些顶点和指向它的边
    nodes = _.filter(nodes, node => !nodes_no_out_ids.includes(node.id));
    edges = _.filter(edges, edge => !nodes_no_out_ids.includes(edge.targetId));

    // 继续重复如上删除
    if (nodes.length === 0) {
      // console.log("没环，全部节点删除完毕", nodes);
    } else if (nodes.length > 0 && preNodesLen !== nodes.length) {
      preNodesLen = nodes.length;
      // console.log("继续检测", edges);
      toPoSort(nodes, edges);
    } else {
      noLoop = false;
      // console.log("有环", JSON.stringify(nodes));
    }
  };

  toPoSort(nodes, edges);
  // console.log(noLoop);
  return noLoop;
};
