/**
 * Created by eatong on 17-3-12.
 */
import React from 'react';
import {render} from 'react-dom';
import {AppContainer} from 'react-hot-loader'
import './styles/app.css';
import App from './App';

render(
  <AppContainer>
    <App />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextRootContainer = require('./App').default;
    render(<NextRootContainer />, document.getElementById('root'));
  })
}
