import qwikloader from '@builder.io/qwik/qwikloader.js?raw';
if (typeof document !== 'undefined') {
  const script = document.createElement('script');
  script.textContent = qwikloader;
  document.head.appendChild(script);
}

import { render } from '@builder.io/qwik';
import './index.css';
import { App } from './App';

render(document.getElementById('app')!, <App />);
