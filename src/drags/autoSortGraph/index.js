import React from "react";
import PropTypes from "prop-types";
import style from "./index.less";

const data = {
  nodes: [
    { id: "1", name: "Node 1" },
    { id: "2", name: "Node 2" },
    { id: "3", name: "Node 2", style: { left: 14, top: 153 } },
    { id: "4", name: "Node 2", style: { left: 14, top: 153 } },
    // { id: "5", name: "Node 4", style: { left: 33, top: 308 } },
    { id: "6", name: "Node 6", style: { left: 31, top: 470 } }
  ],
  edges: [
    { sourceId: "1", targetId: "2" },
    { sourceId: "1", targetId: "3" },
    { sourceId: "2", targetId: "3" },
    { sourceId: "2", targetId: "4" },
    { sourceId: "4", targetId: "6" }
  ]
};

export default class AutoSortGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data };
  }

  render() {
    const { data } = this.state;
    return <div className={style.autoSortGraph}>cd</div>;
  }
}

AutoSortGraph.propTypes = {
  data: PropTypes.object
};
