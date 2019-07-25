import React, {Component} from 'react';
import Editor from "./edit/Editor";
import List from "./list/List";
import {Switch} from "react-router-dom";

class App extends Component {

    render() {
        return (<Switch>
            <Editor path='/:id' />
            <List path='/' />
        </Switch>);
    }
}

export default App;
