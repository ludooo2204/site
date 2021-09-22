import React ,{useEffect,useState} from 'react'
import regression from 'regression';
import '../App.global.css';
import { Line } from 'react-chartjs-2';



const MesureCalys = ({datasEtalons}) => {
	const [value, setValue] = useState('');
	const [valueCorrigé, setValueCorrigé] = useState();
	const [valueArray, setValueArray] = useState([]);
	const [valueArrayX, setValueArrayX] = useState([]);
	const [isRunning, setRunning] = useState(false);
	const [intervalId, setIntervalId] = useState('');
	const [dataEtalonnageTCK03, setDataEtalonnageTCK03] = useState(null);
	const [enregistrement, setEnregistrement] = useState(null);

const enregistrementMemoire=()=>{

}

useEffect(() => {



	const dataTCK03=datasEtalons.filter(e=>e.marquage=="TCK03")[0]
	console.log(dataTCK03)
	let dataParsedForRegression=[]
let ptsEtalonnage=JSON.parse(dataTCK03.ptsEtalonnage)
	for (let i = 0; i < ptsEtalonnage.appareil.length; i++) {
		dataParsedForRegression.push([
			ptsEtalonnage.appareil[i],
			ptsEtalonnage.reference[i],
			ptsEtalonnage.incertitude[i],
		]);
	}
let	resultat = regression.polynomial(dataParsedForRegression, {
		order: 3,
		precision: 10,
	});
	console.log(resultat)

	setDataEtalonnageTCK03(resultat)



}, [])
useEffect(() => {
	if (dataEtalonnageTCK03) console.log(dataEtalonnageTCK03)

}, [dataEtalonnageTCK03])
useEffect(() => {
	if (value) {setValueCorrigé(Math.round(dataEtalonnageTCK03.predict(value)[1]*100)/100);
		document.addEventListener('keydown', (e) => {
			console.log("keypress")
			if (e.key == ' ') {
				setEnregistrement(valueArray)
		console.log(valueArray)

			}
		})

		return document.removeEventListener('keydown',(e) => {
			if (e.key == ' ') {
				setEnregistrement(valueArray)
			}
		})
	}

}, [value])

	useEffect(() => {
		if (dataEtalonnageTCK03) {
			window.electron.ipcRenderer.on('lectureCalys', (arg) => {
			// eslint-disable-next-line no-console
			console.log('arg from lectureCalys');
			console.log(arg.slice(0, -3));
			console.log(arg.split(',')[0]);
			let valeurBrute =arg.split(',')[0].slice(0, -1)
			setValue(valeurBrute);

			// setValueArray([...valueArray, arg]);
			 setValueArray((valueArray) => [
				...valueArray,
				Math.round(dataEtalonnageTCK03.predict(valeurBrute)[1]*100)/100,
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
		});}
	}, [dataEtalonnageTCK03]);

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
			<div
				style={{
					background: '#eceeed76',
					width: '50%',
					margin: '0 auto',
				}}
			>
				<Line data={data} options={options} />
			</div>

			<h2>valeur brute{value} °C</h2>
			{dataEtalonnageTCK03?<h2>valeur Corrigée {valueCorrigé} °C</h2>:null}
			{valueArray?<h2>nbr de mesure ={valueArray.length}</h2>:null}

			{isRunning ? <h1>Run</h1> : <h1>Stop</h1>}
			<button
				type="button"
				onClick={() => {
					setValueArray([]);
					setValueArrayX([]);
				}}
				// onClick={() =>startMyInterval() }
			>
				<span role="img" aria-label="books">
					📚
				</span>
				RAS
			</button>
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

				{!isRunning?<button type="button" onClick={() => startTimer()}>
					<span role="img" aria-label="books">
						📚
					</span>
					Run
				</button>:<button type="button" onClick={() => stopTimer()}>
					<span role="img" aria-label="books">
						📚
					</span>
					stop
				</button>}
				<button
					type="button"
					onClick={() => window.electron.ipcRenderer.xlsBain()}
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

export default MesureCalys
