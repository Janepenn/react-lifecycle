import React from 'react';
import Timer from './demo/Timer';
import AccountList from './demo/AccountList';

import './App.css';

// This is fake account data.
// It mimics data that might be loaded from e.g. a server or database.
const fakeAccounts = [
  {
    id: 1,
    name: 'One',
    email: 'fake.email@example.com',
    password: 'totally fake'
  },
  {
    id: 2,
    name: 'Two',
    email: 'fake.email@example.com',
    password: 'also fake'
  },
  {
    id: 3,
    name: 'Three',
    email: 'also.fake.email@example.com',
    password: 'definitely fake'
  }
];

function App() {
  return (
    <div className="App">
      <Timer />
      <AccountList accounts={fakeAccounts} />
    </div>
  );
}

export default App;
