import React, { useEffect, useState } from 'react';
import regression from 'regression';
import '../App.global.css';
import { Line } from 'react-chartjs-2';

const MesureCalysVide = ({ datasEtalons }) => {
	const [value, setValue] = useState('');
	const [valueCorrigé, setValueCorrigé] = useState();
	const [valueArray, setValueArray] = useState([]);
	const [valueArrayX, setValueArrayX] = useState([]);
	const [isRunning, setRunning] = useState(false);
	const [intervalId, setIntervalId] = useState('');
	const [dataEtalonnageSEC02C, setDataEtalonnageSEC02C] = useState(null);
	const [SEC02Ccorrigé, setSEC02Ccorrigé] = useState(null);
	// console.log(datasEtalons)

	useEffect(() => {
		window.electron.ipcRenderer.ChoixCalys('COM8');

		// const dataTCK03 = datasEtalons.filter((e) => e.marquage == 'TCK03')[0];
		const dataSEC02C = datasEtalons.filter(
			(e) => e.marquage == 'SEC02C'
		)[0];
		// console.log(dataTCK03);
		console.log(dataSEC02C);
		let dataParsedForRegression = [];
		let ptsEtalonnage = JSON.parse(dataSEC02C.ptsEtalonnage);

		for (let i = 0; i < ptsEtalonnage.appareil.length; i++) {
			dataParsedForRegression.push([
				Math.log10(ptsEtalonnage.appareil[i]),
				Math.log10(ptsEtalonnage.reference[i]),
				ptsEtalonnage.incertitude[i],
			]);
		}

		let resultat = regression.polynomial(dataParsedForRegression, {
			order: 5,
			precision: 10,
		});

		let appareilCorrigé = Math.pow(
			10,
			resultat.predict(Math.log10(0.000064))[1]
		);
		console.log(appareilCorrigé);

		console.log(resultat);

		setDataEtalonnageSEC02C(resultat);
	}, []);

	useEffect(() => {
		if (value) {
			setValueCorrigé(
				Math.pow(10, (value - 7.75) / 0.75).toExponential(2)
			);
			//   setValueCorrigé(Math.round(dataEtalonnageTCK03.predict(value)[1]*100)/100);



		}
	}, [value]);

	useEffect(() => {
		if (dataEtalonnageSEC02C) {
			window.electron.ipcRenderer.on('lectureCalys', (arg) => {
				// eslint-disable-next-line no-console
				let valeurBrute = arg.split(',')[0].slice(0, -1);
				setValue(valeurBrute);
				// setValueArray([...valueArray, arg]);
				setValueArray((valueArray) => [
					...valueArray,
					Math.pow(10, (valeurBrute - 7.75) / 0.75),
					// Math.round(dataEtalonnageTCK03.predict(valeurBrute)[1]*100)/100,
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
		}
	}, [dataEtalonnageSEC02C]);

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
				label: 'temperature',
				data: valueArray,
				// data: [0, 1, 2, 3, 4, 5],
				fill: false,
				backgroundColor: '#070913',
				borderColor: 'rgba(00, 99, 132, 0.8)',
			},
		],
	};

	const options = {
		maintainAspectRatio: false,
		scales: {
			yAxes: [
				{
					type: 'logarithmic',
					ticks: {
						beginAtZero: true,

						// callback: function (value, index, values) {
						// 		console.log(value.toExponential(0))
						// 	return value.toExponential(0);
						// 	// return this.getLabelForValue(value).toExponential(
						// 	// 	0
						// 	// );
						// },
					},
				},
			],
		},
	};



const handleInputVide=(e)=>{
	setSEC02Ccorrigé(Math.pow(10,dataEtalonnageSEC02C.predict(Math.log10(e.target.value))[1]))
}

	return (
		<div>
			<div
				style={{
					background: '#eceeed76',
					width: '80%',
					// height: '100px',
					margin: '0 auto',
				}}
			>
				<Line
					data={data}
					options={options}
					height={250}
					width={'90vw'}
				/>
			</div>

			<h2>tension du capteur {value} V</h2>
			{dataEtalonnageSEC02C ? (
				<h2 style={{ fontSize: '5REM' }}>
					valeur Corrigée {valueCorrigé} mbar
				</h2>
			) : null}

			{/* {domaineChoisi} */}
			<div style={{ display: 'flex', flexDirection: 'row' }}>
				<button
					type="button"
					onClick={() => {
						setValueArray([]);
						setValueArrayX([]);
					}}
					// onClick={() =>startMyInterval() }
				>
					Raz du graphe
				</button>

				{!isRunning ? (
					<button type="button" onClick={() => startTimer()}>
						Run
					</button>
				) : (
					<button type="button" onClick={() => stopTimer()}>
						<span role="img" aria-label="books">
							📚
						</span>
						stop
					</button>
				)}
				<label style={{fontSize:'2rem'}}>SEC02C =></label>
				<input onChange={handleInputVide}></input>
				<span style={{fontSize:'2rem'}}>SEC02C corrigé {SEC02Ccorrigé?SEC02Ccorrigé.toExponential(2):null}</span>
			</div>
		</div>
	);
};

export default MesureCalysVide;
