import React from "react";
import LeftList from "./LeftList";
import DragGraphJoint from "./DragGraphJoint";
import { validateConnectFun } from "./joint.config";
import _ from "lodash";
import "./index.less";

/* 
  // 本组件接受和传输到父组件的数据格式为
  { 
    nodes: [
      { id: xx, name: xx, style: { left: xx, top: xx } },
      { id: xx, name: xx }
    ],
    edges: [
      { sourceId: xx, targetId: xx },
    ]
  }
  // 本组件转换并传给左右子组件的数据格式为
  { 
    leftNodes: { nodes: [] }; // 左侧无依赖只有节点,
    rightNodes: { nodes: [], edges: [] }; // 右侧有节点和边
  }
*/

// 将外部传来的未分组的数据分左右组
const separate = (data = {}) => {
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

export default class App extends React.Component {
  constructor(props) {
    super(props);
    // 将外部传来的未分组的数据分左右组
    const separateData = separate(props.data);
    this.state = {
      data: separateData
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
    this.setState(
      { data: { ...data, leftNodes, rightNodes } },
      this.handleChange
    );

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
      if (!_.isEmpty(deleteNode)) {
        delete deleteNode.style;
        leftNodes = {
          ...leftNodes,
          nodes: [deleteNode, ...leftNodes.nodes]
        };
      }
    }
    // 更新数据并传给父组件
    this.setState(
      { data: { leftNodes, rightNodes: { nodes, edges } } },
      this.handleChange
    );
  };

  handleChange = () => {
    const { onChange } = this.props;
    const {
      data: {
        leftNodes: { nodes: lNode = [] },
        rightNodes: { nodes: Rnodes = [], edges = [] }
      }
    } = this.state;
    // 将所有的 nodes 合并在一起，发给父组件
    onChange && onChange({ nodes: [...lNode, ...Rnodes], edges });
  };

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.data, nextProps.data)) {
      const separateData = separate(nextProps.data);
      this.setState({ data: separateData });
    }
  }

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
                validateConnection={(source, target) =>
                  validateConnectFun(rightNodes.edges, source, target)
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
