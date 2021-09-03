import React,{useState} from 'react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.global.css';

const Hello = () => {
  const [value, setValue] = useState("")
  window.electron.ipcRenderer.on('ipc-example', (arg) => {
    // eslint-disable-next-line no-console
    console.log('arg');
    console.log(arg);
  });
  window.electron.ipcRenderer.on('asynchronous-message', (arg) => {
    // eslint-disable-next-line no-console
    console.log('arg from asynchronous-message');
    console.log(arg);
    setValue(arg)
  });

  window.electron.ipcRenderer.myPing();
  // window.electron.ipcRenderer.test();

  return (
    <div>
      <div className="Hello">
        <img width="200px" alt="icon" src={icon} />
      </div>
      <h1>electron-react-boilerplate</h1>
      <h2>{value}</h2>
      <div className="Hello">
        <button
          type="button"
          // onClick={() => window.electron.ipcRenderer.meas()}
          onClick={() =>setInterval(function(){window.electron.ipcRenderer.meas() }, 6000) }
        >
          <span role="img" aria-label="books">
            📚
          </span>
          Measure?
        </button>
        <button
          type="button"
          onClick={() => window.electron.ipcRenderer.meas2()}
        >
          <span role="img" aria-label="books">
            📚
          </span>
          Measure2?
        </button>
        <a
          href="https://github.com/sponsors/electron-react-boilerplate"
          target="_blank"
          rel="noreferrer"
        >
          <button type="button">
            <span role="img" aria-label="books">
              🙏
            </span>
            Donate
          </button>
        </a>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}
