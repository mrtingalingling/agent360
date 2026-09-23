import { mount } from 'ripple';
import App from './App.tsrx';
import { dashboardState } from './state/dashboardState.js';
import './index.css';

(window as any).dashboardState = dashboardState;

const target = document.getElementById('root');
if (target) {
  mount(App, { target });
}
