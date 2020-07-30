import React, { Fragment, Component } from 'react';

// This component illustrates a getDerivedStateFromProps anti-pattern.
// Don't copy this approach!
class EmailInput1 extends Component {
  state = {
    email: this.props.email,
  };

  render() {
    return (
      <label>
        Email1:
        <input onChange={this.handleChange} value={this.state.email} />
      </label>
    );
  }

  handleChange = (event) => {
    this.setState({ email: event.target.value });
  };

  // This lifecycle will be re-run any time the component is rendered,
  // Even if props.email has not changed.
  // For this reason, it should not update state in the way shown below!
  componentWillReceiveProps(nextProps) {
    // This will erase any local state updates!
    // Do not do this!
    this.setState({ email: nextProps.email });
  }
}

//完全可控的组件
function EmailInput2(props) {
  return (
    <label>
      Email2:
      <input
        onChange={(e) => props.onChange(e.target.value)}
        value={props.email}
      />
    </label>
  );
}

//有 key 的非可控组件
class EmailInput3 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      email: 'example@google.com',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = (event) => {
    this.setState({ email: event.target.value });
  };

  render() {
    return (
      <label>
        Email3:
        <input onChange={this.handleChange} value={this.state.email} />
      </label>
    );
  }
}

// This component uses a timer to simulate arbitrary re-renders.
// In a real application, this could happen for a variety of reasons:
// Event handlers that call setState, Flux updates, network responses, etc.
class Timer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      email: 'example@google.com',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.interval = setInterval(
      () =>
        this.setState((prevState) => ({
          count: prevState.count + 1,
        })),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleChange(value) {
    this.setState({ email: value });
  }

  render() {
    return (
      <Fragment>
        <h1>This demo illustrates a derived state anti-pattern</h1>
        <blockquote>Type in the box below:</blockquote>

        <EmailInput1 email={this.state.email} />

        <EmailInput2 email={this.state.email} onChange={this.handleChange} />

        <EmailInput3
          key={new Date().toDateString()}
          defaultEmail={this.state.email}
        />
        <p>
          This component will re-render every second. Each time it renders, the
          text you type will be reset. This illustrates a derived state
          anti-pattern.
        </p>
      </Fragment>
    );
  }
}

export default Timer;
