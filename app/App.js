/**
 * Created by eatong on 17-3-13.
 */
import React, {Component} from 'react';
import {HashRouter, Route, Link} from 'react-router-dom';
import HomePage from './views/HomePage';

export default class App extends Component {
  render() {
    return (
      <HashRouter>
        <div>
          <Route exact path="/" component={HomePage}/>
        </div>
      </HashRouter>
    )
  }
}
