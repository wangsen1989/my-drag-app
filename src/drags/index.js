import React from "react";
import LeftList from "./LeftList";
import DragGraphJoint from "./DragGraphJoint";
import _ from "lodash";
import "./index.less";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data || {}
    };

    // 记录鼠标到 正在拖拽节点的内边 的距离
    this.distanceX = 0;
    this.distanceY = 0;
    // 记录正在拖拽到右侧的节点的放置坐标
    this.draggingNodeStyle = null;
  }

  // 左侧拖拽开始时，记录当下拖拽的节点
  onLeftStart = e => {
    // onLeftStart 的 effectAllowed  和 onRightOver 的 dropEffect 必须一致才能 drop
    e.dataTransfer.effectAllowed = "move";

    const {
      data: { leftNodes = {} }
    } = this.state;
    // 记录当下拖拽的节点
    const draggingNode = leftNodes.nodes.find(
      node => node.id === e.target.dataset.id
    );
    this.setState({ draggingNode });
    // 清空上次记录的节点的放置坐标
    this.draggingNodeStyle = null;
    // 记录鼠标到 正在拖拽节点的内边 的距离，便于 drop 时计算节点的放置坐标
    this.distanceX = e.clientX - (e.currentTarget.offsetLeft || 0);
    this.distanceY = e.clientY - (e.currentTarget.offsetTop || 0);
  };

  // 鼠标拖拽由左进入右时，计算被拖拽节点在右侧应该放置的新坐标
  onRightOver = e => {
    e.dataTransfer.dropEffect = "move";
    e.preventDefault();
    // 要取 right-content 的 offset，用 currentTarget，不然 targrt 会取到子元素 svg
    const draggingNodeStyle = {
      left: e.clientX - (e.currentTarget.offsetLeft || 0) - this.distanceX,
      top: e.clientY - (e.currentTarget.offsetTop || 0) - this.distanceY
    };
    this.draggingNodeStyle = draggingNodeStyle;
  };

  // 左侧拖拽结束，drop 在右侧时，把当下拖拽的节点加入右侧，并从左侧剔除
  onRightDrop = e => {
    e.stopPropagation();
    e.preventDefault();
    let {
      data,
      data: { leftNodes = {}, rightNodes = {} },
      draggingNode
    } = this.state;
    // 节点加入右侧，并设置新的放置坐标
    rightNodes = {
      ...rightNodes,
      nodes: [
        ...rightNodes.nodes,
        { ...draggingNode, style: { ...this.draggingNodeStyle } }
      ]
    };
    // 并从左侧剔除
    leftNodes = {
      ...leftNodes,
      nodes: leftNodes.nodes.filter(node => node.id !== draggingNode.id)
    };

    // 更新数据并传给父组件
    this.setState({ data: { ...data, leftNodes, rightNodes } }, () => {
      const { onChange } = this.props;
      onChange && onChange(this.state.data);
    });
    // 清除左侧列表残留的动画样式
    this.leftListInstance.over &&
      this.leftListInstance.over.classList.remove("drag-up", "drag-down");
  };

  // 右侧内部操作发来的通知，更新本组件存储的右侧的最新状态
  onRightChange = data => {
    let {
      data: { leftNodes, rightNodes }
    } = this.state;
    const { nodes, edges } = data;
    const preIds = _.map(rightNodes.nodes, node => node.id);
    const nowIds = _.map(nodes, node => node.id);

    // 说明右侧删除了节点
    if (preIds.length > nowIds.length) {
      const deleteNode = _.find(
        rightNodes.nodes,
        node => node.id === _.difference(preIds, nowIds)[0]
      );
      // 加入左侧
      !_.isEmpty(deleteNode) &&
        (leftNodes = { ...leftNodes, nodes: [deleteNode, ...leftNodes.nodes] });
    }
    // 更新数据并传给父组件
    this.setState({ data: { leftNodes, rightNodes: { nodes, edges } } }, () => {
      const { onChange } = this.props;
      onChange && onChange(this.state.data);
    });
  };

  render() {
    const {
      data: { leftNodes = {}, rightNodes = {} }
    } = this.state;
    return (
      <div className="app">
        <div className="father">
          <div className="left">
            <div className="left-title">无依赖区域</div>
            <div div className="left-content">
              <LeftList
                data={leftNodes.nodes}
                onDragStart={this.onLeftStart}
                ref={ref => (this.leftListInstance = ref)}
              />
            </div>
          </div>
          <div className="right">
            <div className="right-title">依赖区域</div>
            <div
              className="right-content"
              onDragOver={this.onRightOver}
              onDrop={this.onRightDrop}
            >
              <DragGraphJoint
                ref={ref => (this.DragGraphJoint = ref)}
                data={rightNodes}
                onChange={this.onRightChange}
                config={{}}
                validateConnection={(nodes, edges, source, target) => {
                  // console.log(nodes, edges, source, target);
                  const sourceId = _.get(source, "model.id");
                  const targetId = _.get(target, "model.id");
                  if (sourceId === targetId) {
                    console.log("自己不能连自己");
                    return false;
                    // }else if(){}
                    // else{
                    //   return true;
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
