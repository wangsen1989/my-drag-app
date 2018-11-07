import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import LeftList from "./LeftList";
import DragGraph from "./DragGraph";
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
  }

  // 左侧拖拽开始时，记录当下拖拽的节点
  onLeftStart = e => {
    e.dataTransfer.effectAllowed = "move";

    const {
      data: { leftNodes = {} }
    } = this.state;

    const draggingNode = leftNodes.nodes.find(
      node => node.id === e.target.dataset.id
    );

    this.setState({ draggingNode });
    console.log(e.target.dataset, draggingNode);
  };

  // 左侧拖拽结束，放在右侧时，把当下拖拽的节点加入右侧，并从左侧剔除
  onRightDrop = e => {
    e.stopPropagation();
    e.preventDefault();
    let {
      data,
      data: { leftNodes = {}, rightNodes = {} },
      draggingNode
    } = this.state;
    rightNodes.nodes.push(draggingNode);
    leftNodes = {
      ...leftNodes,
      nodes: leftNodes.nodes.filter(node => node.id !== draggingNode.id)
    };
    this.setState({ data: { ...data, leftNodes, rightNodes } }, () => {
      console.log("right drop", this.state.data);
    });
  };

  // 右侧内部操作发来的通知，更新本组件存储的右侧的最新状态
  onRightChange = rightNodes => {
    const { data } = this.state;
    this.setState({ data: { ...data, rightNodes } });
    console.log(rightNodes);
  };

  render() {
    const {
      data: { leftNodes = {}, rightNodes = {} }
    } = this.state;
    return (
      <div className="father">
        <div className="main">
          <div className="left">
            <LeftList data={leftNodes.nodes} onDragStart={this.onLeftStart} />
          </div>
          <div
            className="right"
            onDragOver={e => {
              e.dataTransfer.dropEffect = "move";
              e.preventDefault();
              //   console.log("right over", e.target);
            }}
            onDrop={this.onRightDrop}
          >
            <DragGraph
              graphId="demo"
              data={rightNodes}
              onChange={this.onRightChange}
            />
          </div>
        </div>
      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
