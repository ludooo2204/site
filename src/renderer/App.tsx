import React,{useState,useEffect} from 'react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
// import { XLSX } from 'XLSX';
import icon from '../../assets/icon.svg';
import './App.global.css';

import { Line } from 'react-chartjs-2';
import { arrayExpression } from '@babel/types';

import { defaults } from 'react-chartjs-2';

// Disable animating charts by default.
defaults.animation = false;

const Hello = () => {
  const [value, setValue] = useState("")
  const [valueArray, setValueArray] = useState([])
  const [valueArrayX, setValueArrayX] = useState([])
  const [isRunning, setRunning] = useState(false)

  const [intervalId, setIntervalId] = useState("")
  useEffect(() => {
    window.electron.ipcRenderer.on('lectureCalys', (arg) => {
      // eslint-disable-next-line no-console
      console.log('arg from lectureCalys');
      console.log(arg.slice(0,-3));
      setValue(arg)
      // setValueArray([...valueArray, arg]);
      setValueArray(valueArray => [...valueArray, Number(arg.slice(0,-3))]);
      setValueArrayX(valueArrayX => [...valueArrayX, valueArrayX.length]);
    });
    window.electron.ipcRenderer.on('ecritureCalys', (arg) => {
    // eslint-disable-next-line no-console
    console.log('arg from ecritureCalys');
    console.log(arg);
  });





}, [])


console.log("render");
const startTimer = () => {
  const intervalIdState =  window.setInterval(() => {
    window.electron.ipcRenderer.meas()

  }, 1000);

  setIntervalId(intervalIdState)
  setRunning(true)
}
const stopTimer = () => {
  if (intervalId) {
    window.clearInterval(intervalId)
    setRunning(false)
  }
}

// window.electron.ipcRenderer.myPing();
// window.electron.ipcRenderer.test();


console.log(valueArray);

const data = {
  labels: valueArrayX,
  datasets: [
    {
      label: '# of Votes',
      data: valueArray,
      fill: false,
      backgroundColor: 'rgb(00, 19, 132)',
      borderColor: 'rgba(00, 99, 132, 0.8)',
    },
  ],
};

const options = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
};
return (
  <div>
      <Line data={data} options={options} redraw={false}/>
      {/* <div className="Hello">
        <img width="200px" alt="icon" src={icon} />
      </div> */}
      <h1>electron-react-boilerplate</h1>
      <h2>{value}</h2>
{isRunning?<h1>Run</h1>:<h1>Stop</h1>}
      <div className="Hello">
        <button
          type="button"
          onClick={() => window.electron.ipcRenderer.meas()}
          // onClick={() =>startMyInterval() }
          >
          <span role="img" aria-label="books">
            📚
          </span>
          Measure?
        </button>

        <button
          type="button"
          onClick={() => startTimer()}
        >
          <span role="img" aria-label="books">
            📚
          </span>
          start
        </button>
        <button
          type="button"
          onClick={() => stopTimer()}
        >
          <span role="img" aria-label="books">
            📚
          </span>
         stop
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
