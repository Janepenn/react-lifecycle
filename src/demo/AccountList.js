import React, { Component, Fragment } from 'react';

// The component below shows a getDerivedStateFromProps anti-pattern.
// Don't copy this approach!

// This component attempts to mix "controlled" and "uncontroled" behavior,
// By initializing its "draft" state to the "committed" props value,
// And then updating it as a user makes edits.
class UncontrolledEmailInput1 extends Component {
  state = {
    email: this.props.email
  };

  componentWillReceiveProps(nextProps) {
    // This lifecycle resets the "draft" email value in state,
    // Whenever a new "commited" email value is passed in props.
    // The downside of this is that the parent component has
    // no way to reset state back to the original props value
    // (at least not without rendering multiple times).
    if (nextProps.email !== this.props.email) {
      this.setState({ email: nextProps.email });
    }
  }

  handleChange = event => {
    this.setState({ email: event.target.value });
  };

  render() {
    return (
      <label>
        Uncontroll1:{' '}
        <input onChange={this.handleChange} value={this.state.email} />
      </label>
    );
  }
}

// This is an example of an "uncontrolled" component.
// We call it this because the component manages its own "draft" state.
class UncontrolledEmailInput2 extends Component {
  // Default the "draft" email to the value passed in via props.
  state = {
    email: this.props.defaultEmail,
    prevPropsUserID: this.props.userID
  };

  static getDerivedStateFromProps(props, state) {
    // Any time the current user changes,
    // Reset any parts of state that are tied to that user.
    // In this simple example, that's just the email.
    if (props.userID !== state.prevPropsUserID) {
      return {
        prevPropsUserID: props.userID,
        email: props.defaultEmail
      };
    }
    return null;
  }

  handleChange = event => {
    this.setState({ email: event.target.value });
  };

  render() {
    return (
      <label>
        Uncontroll2:
        <input onChange={this.handleChange} value={this.state.email} />
      </label>
    );
  }
}

class EditAccountForm extends Component {
  state = {
    draftPassword: this.props.account.password
  };

  handlePasswordChange = event => {
    this.setState({ draftPassword: event.target.value });
  };

  resetForm = () => {
    this.setState({
      draftPassword: this.props.account.password
    });
  };

  render() {
    const { account } = this.props;
    return (
      <form>
        <h2>Account "{account.name}"</h2>
        <UncontrolledEmailInput1 email={account.email} />
        <UncontrolledEmailInput2
          defaultEmail={account.email}
          userID={account.id}
        />
      </form>
    );
  }
}

export default class AccountsList extends Component {
  state = {
    selectedIndex: 0
  };

  render() {
    const { accounts } = this.props;
    const { selectedIndex } = this.state;
    return (
      <Fragment>
        <h1>This demo illustrates a derived state anti-pattern</h1>
        <blockquote>First, make an edit to the account "One" email.</blockquote>
        <EditAccountForm account={accounts[selectedIndex]} />
        <blockquote>Next, select account "Two" below.</blockquote>
        <p>
          Accounts:
          {this.props.accounts.map((account, index) => (
            <label key={account.id}>
              <input
                type="radio"
                name="account"
                checked={selectedIndex === index}
                onChange={() => this.setState({ selectedIndex: index })}
              />{' '}
              {account.name}
            </label>
          ))}
        </p>
        <p>
          The selected name has changed, but the email field still shows your
          edits. Read the inline comments in{' '}
          <code>UncontrolledEmailInput.js</code> to learn why.
        </p>
      </Fragment>
    );
  }
}
