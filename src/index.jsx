/* @refresh reload */
import { render } from 'solid-js/web';
import { Routes, Route, Router } from '@solidjs/router';

import './index.css';
import App from './App';

render(
  () => (
    <Router>
      <Routes>
        <Route path='/' component={App} />
      </Routes>
    </Router>
  ),
  document.getElementById('root')
);
