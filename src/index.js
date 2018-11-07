import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import LeftList from './LeftList'
import DragGraph from "./DragGraph";
import registerServiceWorker from "./registerServiceWorker";
const colors = [
  {
    newIndex: 1,
    color: "red"
  },

  {
    newIndex: 2,
    color: "green"
  },

  {
    newIndex: 3,
    color: "blue"
  },

  {
    newIndex: 4,
    color: "yellow"
  },

  {
    newIndex: 5,
    color: "orange"
  },

  {
    newIndex: 6,
    color: "black"
  }
];
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
        leftNodes: new Array(20)
          .fill("left")
          .map((v, i) => ({ id: `left${i}`, name: `left node${i}` })),
        rightNodes: {
          nodes,
          edges
        }
      }
    };
  }
  render() {
    const {
      data: { leftNodes = [], rightNodes = [] }
    } = this.state;
    return (
      <div className="father">
        <div className="main">
          <div className="left">
            <LeftList data={colors} />
          </div>
          <div className="right">
            <DragGraph
              graphId="demo"
              data={rightNodes}
              onChange={rightNodes => {
                this.setState({ rightNodes });
                console.log(rightNodes);
              }}
            />
          </div>
        </div>
        <div className="foot">foot</div>
      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
