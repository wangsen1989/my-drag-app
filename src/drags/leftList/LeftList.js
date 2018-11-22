/* 
    如果要单独拼装 n 个本组件，形成一组 list 之间互相拖拽，
    可以在不同拽事件里触发父组件的事件，让他改造好数据后再通知本组件
*/

import React from "react";
import _ from "lodash";
import style from "./list.less";

class LeftList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...props };
  }
  componentDidMount() {
    this.setState({ data: this.props.data || [] });
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.data, nextProps.data)) {
      this.setState({ data: nextProps.data || [] });
      this.over &&
        this.over.classList.remove(style["drag-up"], style["drag-down"]);
    }
  }
  dragStart = e => {
    this.dragged = e.currentTarget;
    const { onDragStart } = this.props;
    onDragStart && onDragStart(e);
  };
  dragEnd = e => {
    this.dragged.style.display = "flex";

    // 去掉动画的类
    e.target.classList.remove(style["drag-up"], style["drag-down"]);
    this.over.classList.remove(style["drag-up"], style["drag-down"]);

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
      Number(dgIndex) > Number(taIndex) ? style["drag-up"] : style["drag-down"];

    if (this.over) {
      this.over.classList.remove(style["drag-up"], style["drag-down"]);
    }

    if (!e.target.classList.contains(animateName)) {
      e.target.classList.add(animateName);
      this.over = e.target;
    }

    const { onDragOver } = this.props;
    onDragOver && onDragOver(e);
  };

  onDrop = e => {
    // 如果要单独拼装 n 个本组件，可以在这里触发父组件的事件，让他改造好数据后再通知本组件
    const { onDrop } = this.props;
    onDrop && onDrop(e);
  };

  render() {
    const { data = [] } = this.state;
    return (
      <ul
        className={style["left-node-contain"]}
        onDragOver={this.dragOver}
        onDrop={this.onDrop}
      >
        {data.map((item, i) => {
          return (
            <li
              data-sort-id={i} // 拖动时重新排序的顺序
              data-id={item.id} // 数据真实的 id
              key={item.id}
              className={style["left-node"]}
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
