import React from 'react';

// 1. unsafe lifecycle
// componentWillMount;
// componentWillReceiveProps;
// componentWillUpdate;
// 16.3：为不安全的生命周期引入别名，UNSAFE_componentWillMount、UNSAFE_componentWillReceiveProps 和 UNSAFE_componentWillUpdate。（旧的生命周期名称和新的别名都可以在此版本中使用。）
// 未来 16.x 版本：为 componentWillMount、componentWillReceiveProps 和 componentWillUpdate 启用废弃告警。（旧的生命周期名称和新的别名都将在这个版本中工作，但是旧的名称在开发模式下会产生一个警告。）
// 17.0：删除 componentWillMount、componentWillReceiveProps 和 componentWillUpdate。（在此版本之后，只有新的 “UNSAFE_” 生命周期名称可以使用。)

// 2. auto migrate
// cd your_project
// npx react-codemod rename-unsafe-lifecycles

// 3. manual migrate
// getDerivedStateFromProps(props, state)
// getSnapshotBeforeUpdate(prevProps, prevState)
// componentDidUpdate

// 根据 getDerivedStateFromProps(nextProps, prevState) 的函数签名可知: 其作用是根据传递的 props 来更新 state。
// 它的一大特点是 无副作用 : 由于处在 Render Phase 阶段，所以在每次的更新都要触发， 故在设计 API 时采用了静态方法，
// 其好处是单纯 —— 无法访问实例、无法通过 ref 访问到 DOM 对象等，保证了单纯且高效。值得注意的是，
// 其仍可以通过 props 的操作来产生副作用，这时应该将操作 props 的方法移到 componentDidUpdate 中，减少触发次数。
// 使用建议：
// 1.如果改变 props 的同时，有副作用的产生(如异步请求数据，动画效果)，这时应该使用 componentDidUpdate
// 2.如果想要根据 props 计算属性，应该考虑将结果 memoization 化，参见 memoization
// 3.如果想要根据 props 变化来重置某些状态，应该考虑使用受控组件
// 配合 componentDidUpdate 周期函数，getDerivedStateFromProps 是为了替代 componentWillReceiveProps 而出现的。
// 它将原本 componentWillReceiveProps 功能进行划分 —— 更新 state 和 操作/调用 props，很大程度避免了职责不清而导致过多的渲染, 从而影响应该性能。

// 根据 getSnapshotBeforeUpdate(prevProps, prevState) 的函数签名可知，
// 其在组件更新之前获取一个 snapshot —— 可以将计算得的值或从 DOM 得到的信息传递到 componentDidUpdate(prevProps, prevState, snapshot) 周期函数的第三个参数，常常用于 scroll 位置的定位。

// 4. examples

// 初始化state

// Before
class InitialState1 extends React.Component {
  state = {};

  componentWillMount() {
    this.setState({
      currentColor: this.props.defaultColor,
      palette: 'rgb',
    });
  }
}

// After
// 对于这种类型的组件，最简单的重构是将 state 的初始化，移到构造函数或属性的初始化器内
class InitialState2 extends React.Component {
  state = {
    currentColor: this.props.defaultColor,
    palette: 'rgb',
  };
}

// 获取外部数据

// Before
// 此代码对于服务器渲染（不使用外部数据）和即将推出的异步渲染模式（可能多次启动请求）都存在问题。
class FetchData1 extends React.Component {
  state = {
    externalData: null,
  };

  componentWillMount() {
    this._asyncRequest = loadMyAsyncData().then((externalData) => {
      this._asyncRequest = null;
      this.setState({ externalData });
    });
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel();
    }
  }

  render() {
    if (this.state.externalData === null) {
      // 渲染加载状态 ...
    } else {
      // 渲染真实 UI ...
    }
  }
}

// After
class FetchData2 extends React.Component {
  state = {
    externalData: null,
  };

  componentDidMount() {
    this._asyncRequest = loadMyAsyncData().then((externalData) => {
      this._asyncRequest = null;
      this.setState({ externalData });
    });
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel();
    }
  }

  render() {
    if (this.state.externalData === null) {
      // 渲染加载状态 ...
    } else {
      // 渲染真实 UI ...
    }
  }
}

// 添加事件监听器（或订阅）
// Before
// 这可能导致服务器渲染（永远不会调用 componentWillUnmount）和异步渲染（在渲染完成之前可能被中断，导致不调用 componentWillUnmount）的内存泄漏。
class Subscription1 extends React.Component {
  componentWillMount() {
    this.setState({
      subscribedValue: this.props.dataSource.value,
    });
    // 这是不安全的，它会导致内存泄漏！
    this.props.dataSource.subscribe(this.handleSubscriptionChange);
  }

  componentWillUnmount() {
    this.props.dataSource.unsubscribe(this.handleSubscriptionChange);
  }

  handleSubscriptionChange = (dataSource) => {
    this.setState({
      subscribedValue: dataSource.value,
    });
  };
}

// After
class Subscription2 extends React.Component {
  state = {
    subscribedValue: this.props.dataSource.value,
  };
  componentDidMount() {
    // 事件监听器只有在挂载后添加才是安全的，
    // 因此，如果挂载中断或错误，它们不会泄漏。
    this.props.dataSource.subscribe(this.handleSubscriptionChange);
    // 外部值可能在渲染和挂载期间改变，
    // 在某些情况下，处理这种情况很重要。
    if (this.state.subscribedValue !== this.props.dataSource.value) {
      this.setState({
        subscribedValue: this.props.dataSource.value,
      });
    }
  }

  componentWillUnmount() {
    this.props.dataSource.unsubscribe(this.handleSubscriptionChange);
  }

  handleSubscriptionChange = (dataSource) => {
    this.setState({
      subscribedValue: dataSource.value,
    });
  };
}

// 基于 props 更新 state

// Before
class Update1 extends React.Component {
  state = {
    isScrollingDown: false,
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.currentRow !== nextProps.currentRow) {
      this.setState({
        isScrollingDown: nextProps.currentRow > this.props.currentRow,
      });
    }
  }
}

// After
// prevProps 参数在第一次调用 getDerivedStateFromProps（实例化之后）时为 null，需要在每次访问 prevProps 时添加 if-not-null 检查。
// 在 React 的未来版本中，不传递上一个 props 给这个方法是为了释放内存。（如果 React 无需传递上一个 props 给生命周期，那么它就无需保存上一个 props 对象在内存中。）
class Update2 extends React.Component {
  // 在构造函数中初始化 state，
  // 或者使用属性初始化器。
  state = {
    isScrollingDown: false,
    lastRow: null,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.currentRow !== state.lastRow) {
      return {
        isScrollingDown: props.currentRow > state.lastRow,
        lastRow: props.currentRow,
      };
    }

    // 返回 null 表示无需更新 state。
    return null;
  }
}

//调用外部回调

// Before
class FunctionCall1 extends React.Component {
  componentWillUpdate(nextProps, nextState) {
    if (this.state.someStatefulValue !== nextState.someStatefulValue) {
      nextProps.onChange(nextState.someStatefulValue);
    }
  }
}

// After
// 在异步模式下使用 componentWillUpdate 都是不安全的，因为外部回调可能会在一次更新中被多次调用。相反，应该使用 componentDidUpdate 生命周期，因为它保证每次更新只调用一次
class FunctionCall2 extends React.Component {
  componentDidUpdate(prevProps, prevState) {
    if (this.state.someStatefulValue !== prevState.someStatefulValue) {
      this.props.onChange(this.state.someStatefulValue);
    }
  }
}

// props 更新的副作用

// Before
class Effect1 extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (this.props.isVisible !== nextProps.isVisible) {
      logVisibleChange(nextProps.isVisible);
    }
  }
}

// After
// 与 componentWillUpdate 类似，componentWillReceiveProps 可能在一次更新中被多次调用。
// 因此，避免在此方法中产生副作用非常重要。相反，应该使用 componentDidUpdate，因为它保证每次更新只调用一次
class Effect2 extends React.Component {
  componentDidUpdate(prevProps, prevState) {
    if (this.props.isVisible !== prevProps.isVisible) {
      logVisibleChange(this.props.isVisible);
    }
  }
}

// props 更新时获取外部数据

// Before
class FetchInUpdate1 extends React.Component {
  state = {
    externalData: null,
  };

  componentDidMount() {
    this._loadAsyncData(this.props.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id) {
      this.setState({ externalData: null });
      this._loadAsyncData(nextProps.id);
    }
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel();
    }
  }

  render() {
    if (this.state.externalData === null) {
      // 渲染加载状态 ...
    } else {
      // 渲染真实 UI ...
    }
  }

  _loadAsyncData(id) {
    this._asyncRequest = loadMyAsyncData(id).then((externalData) => {
      this._asyncRequest = null;
      this.setState({ externalData });
    });
  }
}

// After
// getDerivedStateFromProps 生命周期，在渲染新的 props 之前清除旧数据
class FetchInUpdate2 extends React.Component {
  state = {
    externalData: null,
  };

  static getDerivedStateFromProps(props, state) {
    // 保存 prevId 在 state 中，以便我们在 props 变化时进行对比。
    // 清除之前加载的数据（这样我们就不会渲染旧的内容）。
    if (props.id !== state.prevId) {
      return {
        externalData: null,
        prevId: props.id,
      };
    }
    // 无需更新 state
    return null;
  }

  componentDidMount() {
    this._loadAsyncData(this.props.id);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.externalData === null) {
      this._loadAsyncData(this.props.id);
    }
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel();
    }
  }

  render() {
    if (this.state.externalData === null) {
      // 渲染加载状态 ...
    } else {
      // 渲染真实 UI ...
    }
  }

  _loadAsyncData(id) {
    this._asyncRequest = loadMyAsyncData(id).then((externalData) => {
      this._asyncRequest = null;
      this.setState({ externalData });
    });
  }
}

// 更新前读取 DOM 属性
// Before
class ScrollingList1 extends React.Component {
  listRef = null;
  previousScrollOffset = null;

  componentWillUpdate(nextProps, nextState) {
    // 我们正在向列表中添加新项吗？
    // 捕获滚动位置，以便我们稍后可以调整滚动位置。
    if (this.props.list.length < nextProps.list.length) {
      this.previousScrollOffset =
        this.listRef.scrollHeight - this.listRef.scrollTop;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // 如果我们刚刚添加了新项，并且设置了 previousScrollOffset。
    // 调整滚动位置，以便这些新项不会把旧项挤出视图。
    if (this.previousScrollOffset !== null) {
      this.listRef.scrollTop =
        this.listRef.scrollHeight - this.previousScrollOffset;
      this.previousScrollOffset = null;
    }
  }

  render() {
    return <div ref={this.setListRef}>{/* ...内容... */}</div>;
  }

  setListRef = (ref) => {
    this.listRef = ref;
  };
}

// After
class ScrollingList2 extends React.Component {
  listRef = null;

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // 我们正在向列表中添加新项吗？
    // 捕获滚动位置，以便我们稍后可以调整滚动位置。
    if (prevProps.list.length < this.props.list.length) {
      return this.listRef.scrollHeight - this.listRef.scrollTop;
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // 如果我们刚刚添加了新项，并且有了快照值。
    // 调整滚动位置，以便这些新项不会把旧项挤出视图。
    // （此处的快照是从 getSnapshotBeforeUpdate 返回的值）
    if (snapshot !== null) {
      this.listRef.scrollTop = this.listRef.scrollHeight - snapshot;
    }
  }

  render() {
    return <div ref={this.setListRef}>{/* ...内容... */}</div>;
  }

  setListRef = (ref) => {
    this.listRef = ref;
  };
}
