import React from "react";
import ReactDOM from "react-dom";
import registerServiceWorker from "./registerServiceWorker";
import LeftDragRight from "./drags";
import "./index.less";
// mock 图数据结构（节点和边）

// const data = {
//   nodes: [
//     ...new Array(20)
//       .fill("left")
//       .map((v, i) => ({ id: `left${i}`, name: `left node${i}` })),
//     {
//       id: "1",
//       name: "Node 1",
//       style: { left: 10, top: 10 }
//     },
//     {
//       id: "2",
//       name: "Node 2",
//       style: { left: 150, top: 150 }
//     },
//     {
//       id: "3",
//       name: "Node 3",
//       style: { left: 300, top: 300 }
//     },
//     {
//       id: "4",
//       name: "Node 4",
//       style: { left: 500, top: 500 }
//     },
//     {
//       id: "5",
//       name: "Node 5",
//       style: { left: 600, top: 300 }
//     },
//     {
//       id: "6",
//       name: "Node 6",
//       style: { left: 100, top: 500 }
//     }
//   ],
//   edges: [
//     {
//       sourceId: "1",
//       targetId: "2"
//     },
//     {
//       sourceId: "2",
//       targetId: "3"
//     },
//     {
//       sourceId: "3",
//       targetId: "4"
//     }
//   ]
// };

const data = {
  nodes: [
    { id: "left4", name: "left node4" },
    { id: "left9", name: "left node9" },
    { id: "left10", name: "left node10" },
    { id: "left11", name: "left node11" },
    { id: "left12", name: "left node12" },
    { id: "left13", name: "left node13" },
    { id: "left14", name: "left node14" },
    { id: "left15", name: "left node15" },
    { id: "left16", name: "left node16" },
    { id: "left17", name: "left node17" },
    { id: "left18", name: "left node18" },
    { id: "left19", name: "left node19" },
    { id: "1", name: "Node 1", style: { left: 259, top: 29 } },
    { id: "2", name: "Node 2", style: { left: 13, top: 107 } },
    { id: "3", name: "Node 3", style: { left: 10, top: 185 } },
    { id: "4", name: "Node 4", style: { left: 32, top: 263 } },
    { id: "5", name: "Node 5", style: { left: 49, top: 343 } },
    { id: "6", name: "Node 6", style: { left: 75, top: 426 } },
    { id: "left0", name: "left node0", style: { left: 250, top: 124 } },
    { id: "left1", name: "left node1", style: { left: 247, top: 200 } },
    { id: "left2", name: "left node2", style: { left: 251, top: 275 } },
    { id: "left3", name: "left node3", style: { left: 262, top: 351 } },
    { id: "left5", name: "left node5", style: { left: 452, top: 159 } },
    { id: "left6", name: "left node6", style: { left: 451, top: 255 } },
    { id: "left7", name: "left node7", style: { left: 445, top: 351 } },
    { id: "left8", name: "left node8", style: { left: 205, top: 510 } }
  ],
  edges: [
    { sourceId: "1", targetId: "2" },
    { sourceId: "2", targetId: "3" },
    { sourceId: "3", targetId: "4" },
    { sourceId: "4", targetId: "5" },
    { sourceId: "5", targetId: "6" },
    { sourceId: "1", targetId: "left0" },
    { sourceId: "left0", targetId: "left1" },
    { sourceId: "left1", targetId: "left2" },
    { sourceId: "left2", targetId: "left3" },
    { sourceId: "1", targetId: "left5" },
    { sourceId: "left5", targetId: "left6" },
    { sourceId: "left6", targetId: "left7" },
    { sourceId: "6", targetId: "left8" },
    { sourceId: "left3", targetId: "left8" },
    { sourceId: "left7", targetId: "left8" },
    // { sourceId: "left8", targetId: "1" }, // 有环
    { sourceId: "left1", targetId: "4" },
    { sourceId: "left0", targetId: "3" },
    { sourceId: "left2", targetId: "5" }
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
                id: Math.random()
                  .toString()
                  .substr(0, 5),
                name: `新节点-${Math.random()
                  .toString()
                  .substr(0, 5)}`
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
