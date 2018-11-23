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
    e.dataTransfer.effectAllowed = "move";
    e.target.style.cursor = "move";
    this.dragged = e.currentTarget;
    this.dgIndex = Number(this.dragged.dataset["sortId"]);
    e.target.classList.add(style["drag-start"]);
    e.target.parentElement.classList.add(style["drag-in-ul"]);

    const { onDragStart } = this.props;
    onDragStart && onDragStart(e);
  };

  dragEnd = e => {
    e.target.style.cursor = "";
    if (!this.dragged) return;
    this.dragged.style.display = "flex";

    // 去掉动画的类
    e.target.classList.remove(
      style["drag-up"],
      style["drag-down"],
      style["drag-start"]
    );
    e.target.parentElement.classList.remove(style["drag-in-ul"]);

    this.over.classList.remove(style["drag-up"], style["drag-down"]);

    // 数据重新排列
    const { data = [] } = this.state;
    const from = Number(this.dragged.dataset["sortId"]);
    const to = Number(this.over.dataset["sortId"]);
    data.splice(to, 0, data.splice(from, 1)[0]);
    this.setState({ data: data }, () => {
      // 拖拽时，鼠标 hover 的目标会变成别的元素，导致样式 bug，请看：https://codepen.io/wangsen1989/pen/LXpwev
      // 所以不用 css 的 :hover 来显示 li 背景色，而是用 mouse 事件
      const lis = [...document.querySelectorAll(`.${style["left-node"]}`)];
      _.forEach(lis, el => {
        el.classList.remove(style["li-mouse-over"]);
        el.style.cursor = "";
      });
      this.dragged.classList.add(style["li-mouse-over"]);

      this.over = null;
      this.dragged = null;
    });

    const { onDragEnd } = this.props;
    onDragEnd && onDragEnd(e);
  };

  dragOver = e => {
    if (!this.dragged) return;
    e.preventDefault();
    this.dragged.style.display = "none";
    if (e.target.tagName !== "LI") {
      return;
    }
    e.target.style.cursor = "move";

    //判断当前拖拽target 和 经过的target 的上下顺序，加动画的类
    const taIndex = e.target.dataset["sortId"];
    const animateName =
      Number(this.dgIndex) > Number(taIndex)
        ? style["drag-up"]
        : style["drag-down"];

    if (this.over && this.over !== e.target) {
      this.over.classList.remove(style["drag-up"], style["drag-down"]);
    }

    if (
      this.dragged !== e.target &&
      this.over !== e.target &&
      !e.target.classList.contains(animateName)
    ) {
      e.target.classList.add(animateName);
      this.dgIndex =
        animateName === style["drag-up"] ? this.dgIndex - 1 : this.dgIndex + 1;
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

  onMouseOver = e => {
    const lis = [...document.querySelectorAll(`.${style["left-node"]}`)];
    _.forEach(lis, el => {
      el.classList.remove(style["li-mouse-over"]);
    });
    e.target.classList.add(style["li-mouse-over"]);
  };

  onMouseOut = e => {
    e.target.classList.remove(style["li-mouse-over"]);
  };

  // 因为拖拽到右侧放下，本身不会触发本组件的清除左侧列表内残留的样式，所以在组件外部调用
  clearCursor = lis => {
    lis = lis || [...document.querySelectorAll(`.${style["left-node"]}`)];
    _.forEach(lis, el => {
      el.style.cursor = "";
    });
  };

  // 因为拖拽到右侧放下，本身不会触发本组件的清除左侧列表内残留的样式，所以在组件外部调用
  clearDragInUl = () => {
    document
      .querySelector(`.${style["left-node-contain"]}`)
      .classList.remove(style["drag-in-ul"]);
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
              onMouseOver={this.onMouseOver}
              onMouseOut={this.onMouseOut}
            >
              <p>{item.name}</p>
            </li>
          );
        })}
      </ul>
    );
  }
}
export default LeftList;
