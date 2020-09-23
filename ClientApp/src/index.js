import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import './index.css';
import 'react-perfect-scrollbar/dist/css/styles.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Navigation } from './components/Navigation';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Navigation />, document.getElementById('root'));
registerServiceWorker();
