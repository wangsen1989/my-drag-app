import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
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
        nodes,
        edges
      }
    };
  }
  render() {
    const { data } = this.state;
    return (
      <DragGraph
        graphId="demo"
        data={data}
        onChange={data => {
          this.setState({ data });
          console.log(data);
        }}
      />
    );
  }
}
ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
