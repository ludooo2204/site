import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Switch, Route, Link } from 'react-router-dom';
// import { XLSX } from 'XLSX';
import icon from '../../assets/icon.svg';
import './App.global.css';

import { Line } from 'react-chartjs-2';
import { arrayExpression } from '@babel/types';
import regression from 'regression';
import { defaults } from 'react-chartjs-2';
import  GestionEtalons  from './components/GestionEtalons';
// Disable animating charts by default.
defaults.animation = false;

const Mesure = () => {
	const [domaine, setDomaine] = useState(null);

	const MesureCalys = () => {
		const [value, setValue] = useState('');
		const [valueArray, setValueArray] = useState([]);
		const [valueArrayX, setValueArrayX] = useState([]);
		const [isRunning, setRunning] = useState(false);

		const [intervalId, setIntervalId] = useState('');
		console.log('coucou from Mesure calys');
		useEffect(() => {
			window.electron.ipcRenderer.on('lectureCalys', (arg) => {
				// eslint-disable-next-line no-console
				console.log('arg from lectureCalys');
				console.log(arg.slice(0, -3));
				setValue(arg);

				// setValueArray([...valueArray, arg]);
				setValueArray((valueArray) => [
					...valueArray,
					Number(arg.slice(0, -3)),
				]);
				setValueArrayX((valueArrayX) => [
					...valueArrayX,
					valueArrayX.length,
				]);
			});
			window.electron.ipcRenderer.on('ecritureCalys', (arg) => {
				// eslint-disable-next-line no-console
				console.log('arg from ecritureCalys');
				console.log(arg);
			});
		}, []);

		console.log('render');
		const startTimer = () => {
			const intervalIdState = window.setInterval(() => {
				window.electron.ipcRenderer.meas();
			}, 1000);

			setIntervalId(intervalIdState);
			setRunning(true);
		};
		const stopTimer = () => {
			if (intervalId) {
				window.clearInterval(intervalId);
				setRunning(false);
			}
		};

		const data = {
			labels: valueArrayX,
			// labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					label: '# of Votes',
					data: valueArray,
					// data: [0, 1, 2, 3, 4, 5],
					fill: false,
					backgroundColor: '#070913',
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
				<div style={{ background: '#eceeed76' }}>
					<Line data={data} options={options} redraw={false} />
				</div>

				<h2>{value}</h2>
				{isRunning ? <h1>Run</h1> : <h1>Stop</h1>}
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

					<button type="button" onClick={() => startTimer()}>
						<span role="img" aria-label="books">
							📚
						</span>
						start
					</button>
					<button type="button" onClick={() => stopTimer()}>
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
						ouvrir le fichier XLS
					</button>
				</div>
			</div>
		);
	};
	const Simulation = () => {
		const [pointsMesure, setPointsMesure] = useState(0);
		const ptsTTH = [760, 1000, 1100, 1210, 1270];
		useEffect(() => {
			window.electron.ipcRenderer.on('ecritureCalys', (arg) => {
				// eslint-disable-next-line no-console
				console.log('arg from ecritureCalys');
				console.log(arg);
			});
			document.addEventListener('keydown', (event) => {
				if (event.key == 'ArrowRight') {
					setPointsMesure((pointsMesure) => pointsMesure + 1);
				}
			});
		}, []);
		useEffect(() => {
			window.electron.ipcRenderer.ecriture(ptsTTH[pointsMesure]);
		}, [pointsMesure]);
		return (
			<div>
				<div className="Hello">
					{['TTH', 'MINIDIAMANT', 'BMI54'].map((four, index) => (
						<button
							type="button"
							onClick={() =>
								window.electron.ipcRenderer.ecriture(four)
							}
						>
							<span role="img" aria-label="books">
								📚
							</span>
							{four}
						</button>
					))}
				</div>
				{ptsTTH[pointsMesure]}
			</div>
		);
	};
	return (
		<div>
			<div
				style={{
					display: 'flex',
					background: '#fafafa55',
					justifyContent: 'space-between',
				}}
			>
				<div style={{ margin: 10 }} onClick={() => setDomaine('vide')}>
					vide
				</div>
				<div
					style={{ margin: 10 }}
					onClick={() => setDomaine('simulation')}
				>
					simulation
				</div>
				<div style={{ margin: 10 }} onClick={() => setDomaine('debit')}>
					debit
				</div>
				<div
					style={{ margin: 10 }}
					onClick={() => setDomaine('mesure')}
				>
					mesure
				</div>
			</div>
			<h1>{domaine}</h1>
			{domaine == 'mesure' ? <MesureCalys /> : null}
			{domaine == 'simulation' ? <Simulation /> : null}
		</div>
	);
};

const TestP = () => {
	return (
		<div>
			<h1>Test</h1>
		</div>
	);
};
const Home = () => {
	return (
		<div>
			<h1>Home</h1>
		</div>
	);
};
export default function App() {
	return (
		<Router>
			<div>
				<nav>
					<ul>
						<li>
							<Link to="/">Home</Link>
						</li>
						<li>
							<Link to="/mesure">MESURE</Link>
						</li>
						<li>
							<Link to="/gestionEtalons">Gestion des étalons</Link>
						</li>
					</ul>
				</nav>

				{/* A <Switch> looks through its children <Route>s and
					renders the first one that matches the current URL. */}
				<Switch>
					<Route path="/mesure">
						<Mesure />
					</Route>
					<Route path="/gestionEtalons">
						<GestionEtalons />
					</Route>
					<Route path="/">
						<Home />
					</Route>
				</Switch>
			</div>
		</Router>
	);
}
