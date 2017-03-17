/**
 * Created by eatong on 17-3-13.
 */
import React, {Component}from 'react';
import {HashRouter, Route, Link} from 'react-router-dom';
import {Provider} from 'mobx-react';

import TodoState from './stores/Todo';

import HomePage from './views/HomePage';
import TodoPage from './views/TodoPage';


const stores = {
  todo: new TodoState()
};


export default  class App extends Component {
  render() {
    return (
      <Provider {...stores}>
        <HashRouter>
          <div>
            <Route exact path="/" component={HomePage}/>
            <Route exact path="/todo" component={TodoPage}/>
          </div>
        </HashRouter>
      </Provider>
    )
  }
}
