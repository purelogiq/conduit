import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import App from './components/App';
import TestApp from './components/TestApp';
import AutolandController from './components/AutolandController';
import InvalidUrl from './components/InvalidUrl';

const getRoutes = history => (
  <Router history={history || browserHistory}>
    <Route path="/" component={App}>
      <Route path="repos/:repo_id/series/*" component={AutolandController} />
    </Route>
    <Route path="/test" component={TestApp} />
    <Route path="/*" component={InvalidUrl} />
  </Router>
);

const renderRoutes = () => {
  render(getRoutes(), document.getElementById('root'));
};

module.exports = {
  getRoutes,
  renderRoutes,
};
