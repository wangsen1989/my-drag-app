import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import LeftList from "./LeftList";
import DragGraphJoint from "./DragGraphJoint";
import registerServiceWorker from "./registerServiceWorker";

// mock 图数据结构（节点和边）

const nodes = [
  {
    id: "1",
    name: "Node 1",
    style: { left: "10px", top: "10px" }
  },
  {
    id: "2",
    name: "Node 2",
    style: { left: "150px", top: "150px" }
  },
  {
    id: "3",
    name: "Node 3",
    style: { left: "300px", top: "300px" }
  },
  {
    id: "4",
    name: "Node 4",
    style: { left: "500px", top: "500px" }
  },
  {
    id: "5",
    name: "Node 5",
    style: { left: "600px", top: "300px" }
  },
  {
    id: "6",
    name: "Node 6",
    style: { left: "100px", top: "500px" }
  }
];
const edges = [
  {
    sourceId: "1",
    targetId: "2"
  },
  {
    sourceId: "2",
    targetId: "3"
  },
  {
    sourceId: "3",
    targetId: "4"
  }
];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        leftNodes: {
          nodes: new Array(20)
            .fill("left")
            .map((v, i) => ({ id: `left${i}`, name: `left node${i}` }))
        },
        rightNodes: {
          nodes,
          edges
        }
      }
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
    this.distanceX = e.clientX - e.target.offsetLeft;
    this.distanceY = e.clientY - e.target.offsetTop;
  };

  // 鼠标拖拽由左进入右时，计算被拖拽节点在右侧应该放置的新坐标
  onRightOver = e => {
    e.dataTransfer.dropEffect = "move";
    e.preventDefault();
    const draggingNodeStyle = {
      left: e.clientX - e.target.offsetLeft - this.distanceX,
      top: e.clientY - e.target.offsetTop - this.distanceY
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
    this.setState({ data: { ...data, leftNodes, rightNodes } });
    // 清除左侧列表残留的动画样式
    this.leftListInstance.over &&
      this.leftListInstance.over.classList.remove("drag-up", "drag-down");
  };

  // 右侧内部操作发来的通知，更新本组件存储的右侧的最新状态
  onRightChange = rightNodes => {
    const { data } = this.state;
    this.setState({ data: { ...data, rightNodes } });
  };

  render() {
    const {
      data: { leftNodes = {}, rightNodes = {} }
    } = this.state;
    return (
      <div className="app">
        <div className="father">
          <div className="left">
            <LeftList
              data={leftNodes.nodes}
              onDragStart={this.onLeftStart}
              ref={ref => (this.leftListInstance = ref)}
            />
          </div>
          <div
            className="right"
            onDragOver={this.onRightOver}
            onDrop={this.onRightDrop}
          >
            <DragGraphJoint
              data={rightNodes}
              onChange={this.onRightChange}
              config={{
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
