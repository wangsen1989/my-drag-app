import React from "react";

class LeftList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...props };
  }
  componentDidMount() {
    this.setState({ data: this.props.data || [] });
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ data: nextProps.data || [] });
  }
  dragStart = e => {
    this.dragged = e.currentTarget;
    const { onDragStart } = this.props;
    onDragStart && onDragStart(e);
  };
  dragEnd = e => {
    this.dragged.style.display = "block";

    // 去掉动画的类
    e.target.classList.remove("drag-up");
    e.target.classList.remove("drag-down");
    this.over.classList.remove("drag-up");
    this.over.classList.remove("drag-down");

    // 数据重新排列
    const { data = [] } = this.state;
    const from = Number(this.dragged.dataset["sortId"]);
    const to = Number(this.over.dataset["sortId"]);
    data.splice(to, 0, data.splice(from, 1)[0]);
    this.setState({ data: data });

    const { onDragEnd } = this.props;
    onDragEnd && onDragEnd(e);
  };

  dragOver = e => {
    e.preventDefault();
    this.dragged.style.display = "none";
    if (e.target.tagName !== "LI") {
      return;
    }

    //判断当前拖拽target 和 经过的target 的上下顺序，加动画的类
    const dgIndex = this.dragged.dataset["sortId"];
    const taIndex = e.target.dataset["sortId"];
    const animateName =
      Number(dgIndex) > Number(taIndex) ? "drag-up" : "drag-down";

    if (this.over) {
      this.over.classList.remove("drag-up", "drag-down");
    }

    if (!e.target.classList.contains(animateName)) {
      e.target.classList.add(animateName);
      this.over = e.target;
    }

    const { onDragOver } = this.props;
    onDragOver && onDragOver(e);
  };

  render() {
    const { data = [] } = this.state;
    return (
      <ul onDragOver={this.dragOver} className="left-node-contain">
        {data.map((item, i) => {
          return (
            <li
              data-sort-id={i} // 拖动时重新排序的顺序
              data-id={item.id} // 数据真实的 id
              key={item.id}
              className="left-node"
              draggable="true"
              onDragEnd={this.dragEnd}
              onDragStart={this.dragStart}
            >
              {item.name}
            </li>
          );
        })}
      </ul>
    );
  }
}
export default LeftList;
