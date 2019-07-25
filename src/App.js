import React, { Component } from 'react';
import './App.css';
import Amplify, { Storage } from 'aws-amplify';
import awsmobile from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react';
import Editor from "./components/edit/Editor";
import List from "./components/list/List";
import {Switch} from "react-router-dom";
Amplify.configure(awsmobile);
Storage.configure({ level: 'public' });

class App extends Component {
  render() {
    return (
        <Switch>
          <Editor path='/:id' />
          <List path='/' />
        </Switch>
    );
  }
}

export default withAuthenticator(App);
