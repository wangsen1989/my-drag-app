import React from "react";
import ReactDOM from "react-dom";
import registerServiceWorker from "./registerServiceWorker";
import LeftDragRight from "./drags";
import "./index.less";
// mock 图数据结构（节点和边）

const data = {
  nodes: [
    ...new Array(20)
      .fill("left")
      .map((v, i) => ({ id: `left${i}`, name: `left node${i}` })),
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
  ],
  edges: [
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
  ]
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data };
  }

  render() {
    const { data } = this.state;
    return (
      <div className="xxx">
        {/* LeftDragRight 接受未分组组的数据 */}
        <LeftDragRight
          data={data}
          onChange={newData => {
            this.setState({ data: newData });
          }}
        />
        <button
          onClick={() => {
            let {
              data: { nodes, edges }
            } = this.state;
            nodes = [
              {
                id: Math.random().toString().substr(0,5),
                name: `新节点-${Math.random().toString().substr(0,5)}`
              },
              ...nodes
            ];
            this.setState({ data: { nodes, edges } }, () => {
              console.log(this.state.data);
            });
          }}
        >
          增加一个节点
        </button>
        <button
          style={{ margin: "0 10px" }}
          onClick={() => {
            let {
              data: { nodes, edges }
            } = this.state;
            nodes = nodes.slice(1);
            this.setState({ data: { nodes, edges } }, () => {
              console.log(this.state.data);
            });
          }}
        >
          删除第一个无依赖节点
        </button>
        <button
          style={{ margin: "0 10px" }}
          onClick={() => {
            let {
              data: { nodes, edges }
            } = this.state;
            nodes = nodes.slice(0, nodes.length - 1);
            this.setState({ data: { nodes, edges } }, () => {
              console.log(this.state.data);
            });
          }}
        >
          删除最后一个有依赖节点
        </button>
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
