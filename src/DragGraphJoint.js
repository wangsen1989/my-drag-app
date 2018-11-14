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
    //把 node.id 和 画节点生成的 cell.id 映射，因为画线时只识别 cell.id
    this.nodeMapToCell = {};
  }

  componentDidMount() {
    const { nodes, edges } = this.state;
    // 初始化数据模型 model
    this.graph = new joint.dia.Graph();
    // 初始化画布 view， paperCgf 中会把 model view 双向绑定
    this.paper = new joint.dia.Paper(paperCgf(this));
    // 画节点：改变 view 并把数据录入 model
    this.drawNodes(nodes);
    // 画边：改变 view 并把数据录入 model
    this.drawEdges(edges);
    // view 画布监听点击事件，处理自定义交互
    this.listenPaper(this.paper);
    // model 监听数据的变化并传出去,但是不能响应边的删除和节点的增删，所以边和节点需要自己监听部分事件
    this.graph.on("change", this.handleChange);
  }

  // 画所有传进来的节点。此后用户外部再传节点，再在 componentWillReceiveProps 单独画那一个节点
  drawNodes = nodes => {
    _.forEach(nodes, node => {
      const {
        id,
        name,
        style: { left, top }
      } = node;

      // view： 按照模板自定义每个节点的位置， 信息
      const cell = nodeComponent
        .clone()
        .position(Number(left), Number(top))
        .attr("label/text", name);

      // model view 中加入节点
      this.graph.addCell(cell);

      // 把 node.id 和 画节点生成的 cell.id 映射，drawEdges 时找到 node 节点对应的 cell
      this.nodeMapToCell[id] = cell.id;
    });
  };

  // 画所有外部传进来的边。此后用户手动连线不用处理，框架会自己同步数据和视图
  drawEdges = edges => {
    _.forEach(edges, edge => {
      // 定义一种边
      const link = new joint.dia.Link({
        source: { id: this.nodeMapToCell[edge.sourceId], port: "pBottom" },
        target: { id: this.nodeMapToCell[edge.targetId], port: "pTop" },
        ...defaultLinkCfg
      });
      // 监听边的删除并传出去
      link.on("remove", this.handleChange);

      // model view 中加入边
      this.graph.addCell(link);
    });
  };

  listenPaper(paper) {
    // 点击节点显示删除节点按钮
    paper.on("cell:pointerclick", cell => {
      this.clickedCell && this.clickedCell.classList.remove("delete-cell-show");
      cell.el.classList.add("delete-cell-show");
      this.clickedCell = cell.el;
    });
    // 点击空白处不显示删除节点按钮
    paper.on("blank:pointerclick", () => {
      this.clickedCell && this.clickedCell.classList.remove("delete-cell-show");
    });
    // 点删除节点按钮提示用户
    paper.on("element:delete", (elementView, evt) => {
      evt.stopPropagation();
      if (window.confirm("确定要把该节点移到左侧无依赖区吗?")) {
        elementView.model.remove();
        // console.log(elementView.model);
        this.handleChange();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    // 外部新传进来节点，只需再画最新传进来的那一个节点
    if (!_.isEqual(this.props.data, nextProps.data)) {
      this.drawNodes(
        _.difference(
          _.get(nextProps, "data.nodes"),
          _.get(this.props, "data.nodes")
        )
      );
    }
    // TODO: 外部删除节点和边
  }

  handleChange = () => {
    const edges = this.graph.getLinks(); //获取所有边
    const nodes = this.graph.getElements(); //获取所有节点
    const { onChange } = this.props;
    onChange && onChange({ nodes, edges });
  };
  render() {
    return <div id="placeholder" />;
  }
}

export default DragGraphJoint;
