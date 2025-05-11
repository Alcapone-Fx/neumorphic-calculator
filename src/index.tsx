import { render } from 'preact';

import { Calculator } from './components/organisms/Calculator/Calculator';

import './styles/global.css';

export function App() {
  return <Calculator />;
}

render(<App />, document.getElementById('app'));
