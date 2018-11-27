import React from "react";
import ReactDOM from "react-dom";
import registerServiceWorker from "./registerServiceWorker";
import LeftDragRight from "./drags";
import AutoSortGraph from "./drags/autoSortGraph";
import style from "./index.less";
// mock 图数据结构（节点和边）

const data = {
  nodes: [
    { id: "left6", name: "left node6" },
    { id: "left0", name: "left node0" },
    { id: "left2", name: "left node2" },
    { id: "5", name: "Node 5" },
    { id: "3", name: "Node 3" },
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
    { id: "1", name: "Node 1", style: { left: 245, top: 26 } },
    { id: "2", name: "Node 2", style: { left: 14, top: 153 } },
    { id: "4", name: "Node 4", style: { left: 33, top: 308 } },
    { id: "6", name: "Node 6", style: { left: 31, top: 470 } },
    { id: "left1", name: "left node1", style: { left: 229, top: 177 } },
    { id: "left3", name: "left node3", style: { left: 262, top: 351 } },
    { id: "left5", name: "left node5", style: { left: 452, top: 159 } },
    { id: "left7", name: "left node7", style: { left: 445, top: 351 } },
    {
      id: "left8",
      name: "left node8 cccccaaaaaaa",
      style: { left: 294, top: 648 }
    }
  ],
  edges: [
    { sourceId: "1", targetId: "2" },
    { sourceId: "6", targetId: "left8" },
    { sourceId: "left3", targetId: "left8" },
    { sourceId: "left7", targetId: "left8" },
    { sourceId: "2", targetId: "4" },
    { sourceId: "4", targetId: "6" },
    { sourceId: "1", targetId: "left1" },
    { sourceId: "left1", targetId: "left3" },
    { sourceId: "1", targetId: "left5" },
    { sourceId: "left5", targetId: "left7" }
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
      <div className={style.app}>
        <div className={style.leftDragRight}>
          {/* LeftDragRight 接受未分组组的数据 */}
          <LeftDragRight
            data={data}
            onChange={newData => {
              this.setState({ data: newData });
            }}
            onSubmit={data => {
              console.log("要提交的数据为", data);
            }}
          />
        </div>
        <div className={style.autoSortGraph}>
          <AutoSortGraph />
        </div>
      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
