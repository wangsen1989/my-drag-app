import React from "react";
import ReactDOM from "react-dom";
import registerServiceWorker from "./registerServiceWorker";
import LeftDragRight from "./drags";
import "./index.less";
// mock 图数据结构（节点和边）

const nodes = [
  {
    id: "1",
    name: "Node 1",
    style: { left: 10, top: 10 }
  },
  {
    id: "2",
    name: "Node 2",
    style: { left: 150, top: 150 }
  },
  {
    id: "3",
    name: "Node 3",
    style: { left: 300, top: 300 }
  },
  {
    id: "4",
    name: "Node 4",
    style: { left: 500, top: 500 }
  },
  {
    id: "5",
    name: "Node 5",
    style: { left: 600, top: 300 }
  },
  {
    id: "6",
    name: "Node 6",
    style: { left: 100, top: 500 }
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
    // TODO: 将一组数据分依赖
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

  render() {
    const { data } = this.state;
    return (
      <div className="xxx">
        {/* LeftDragRight 只接受分好组的数据 */}
        <LeftDragRight
          data={data}
          onChange={data => {
            this.setState({ data });
          }}
        />
        <button
          onClick={() => {
            console.log(this.state.data);
          }}
        >
          提交
        </button>
      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
