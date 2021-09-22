import React, { useState, useEffect, useRef } from 'react';
import { MemoryRouter as Router, Switch, Route, Link } from 'react-router-dom';
// import { XLSX } from 'XLSX';

import icon from '../../assets/icon.svg';
import './App.global.css';
import { Line } from 'react-chartjs-2';
import { arrayExpression } from '@babel/types';
import regression from 'regression';
import { defaults } from 'react-chartjs-2';
import GestionEtalons from './components/GestionEtalons';
import MesureCalys from './components/MesureCalys';
import RechercheDeca from './components/RechercheDeca';
import InterventionAtelier from './components/InterventionAtelier';
import Simulation from './components/simulation/Simulation'
// Disable animating charts by default.
defaults.animation = false;

const Mesure = () => {
	const [domaineChoisi, setDomaineChoisi] = useState(null);
	const [inputValue, setInputValue] = useState('');
	const [datasEtalons, setDatasEtalons] = useState(null);
	const [resultatModelisation, setResultatModelisation] = useState(null);

	useEffect(() => {
		window.electron.ipcRenderer.on('db', (arg) => {
			console.log('db from front');
			console.log(arg);
		});

		fetch('http://localhost/API_test/get.php')
			.then((reponse) => reponse.json())
			.then((reponse) => {
				console.log(reponse);
				let modelisationTemp = reponse.filter((e) => e.modelisation);
				let modelisationUnique = [
					...new Set(modelisationTemp.map((item) => item.marquage)),
				];
				console.log(modelisationUnique);
				setDatasEtalons(reponse.filter((e) => e.modelisation));
			});
	}, []);
	useEffect(() => {
		console.log(datasEtalons);
	}, [datasEtalons]);
	useEffect(() => {}, [resultatModelisation]);

	useEffect(() => {
		if (resultatModelisation) resultatModelisation.predict(1e-3);

		console.log('coucou');
		// console.log(resultatModelisation.predict(-2));
	}, [resultatModelisation]);


	const handleInput = (e) => {
		console.log(e.target.value);
		setInputValue(e.target.value);
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
				<div
					style={{ margin: 10 }}
					onClick={() => setDomaineChoisi('VIDE')}
				>
					vide
				</div>
				<div
					style={{ margin: 10 }}
					onClick={() => setDomaineChoisi('simulation')}
				>
					simulation
				</div>
				<div
					style={{ margin: 10 }}
					onClick={() => setDomaineChoisi('debit')}
				>
					debit
				</div>
				<div
					style={{ margin: 10 }}
					onClick={() => setDomaineChoisi('mesure')}
				>
					mesure
				</div>
			</div>
			<h1>{domaineChoisi}</h1>
			{/* <input
			type="text"
			value={Number(inputValue)}
			onChange={handleInput}
			/> */}
			{domaineChoisi == 'mesure' ? (
				<MesureCalys datasEtalons={datasEtalons} />
			) : null}
			{domaineChoisi == 'simulation' ? <Simulation /> : null}
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
	// const [db, setDb] = useState(null)
	// const [db, setDb] = useState(null)
	useEffect(() => {
		window.electron.ipcRenderer.on('xlsECMEDrop', (arg) => {
			// eslint-disable-next-line no-console
			console.log('arg from xlsBain');
			// arg.forEach((element) => {
			// 	element.date_prevue = new Date(
			// 		element.date_prevue
			// 	).toLocaleDateString('FR-fr');
			// });
			console.log(arg);
			// setDatas(arg);
		});
		document.body.addEventListener('dragover', (evt) => {
			evt.preventDefault();
			console.log('dragover');
		});

		document.addEventListener('drop', (event) => {
			console.log('hello');
			event.preventDefault();
			event.stopPropagation();

			for (const f of event.dataTransfer.files) {
				// Using the path attribute to get absolute file path
				console.log('File Path of dragged files: ', f.path);
				window.electron.ipcRenderer.xlsECMEDrop(f.path);
			}
		});
	}, []);
	return (
		<div>
			<h1>Home</h1>
		</div>
	);
};
const Incertitude = () => {
	let resolutionEtalonNumerique = 0.1;
	let resolutionAppareilNumerique = 0.1;
	let deriveEtalon = 0.2;
	let uEtalonnage = 0.25;
	let coefficientTempCalibrateur = 0.1;
	let uLectureAppareil = resolutionAppareilNumerique / Math.sqrt(3);
	let uLectureCalibrateur = resolutionEtalonNumerique / Math.sqrt(3);
	console.log(uLectureCalibrateur);
	let uDeriveEtalon = (deriveEtalon * 2) / Math.sqrt(3);
	let uCoefficientTempCalibrateur = coefficientTempCalibrateur / Math.sqrt(3);
	let uComposée = Math.sqrt(
		uEtalonnage * uEtalonnage +
			uLectureCalibrateur * uLectureCalibrateur +
			uLectureAppareil * uLectureAppareil +
			uDeriveEtalon * uDeriveEtalon +
			uCoefficientTempCalibrateur * uCoefficientTempCalibrateur
	);
	let uElargie = uComposée * 2;
	console.log('uComposée = ', uComposée);
	console.log('uElargie = ', uElargie);

	return (
		<div>
			<h1>Guide pour l'incertitude de mesure</h1>
			<h4>voir la console pour exemple de calcul 'F12'</h4>
			<h2>Evaluer le modele</h2>
			<p>
				Evaluer le modele sous la forme de X=f(x1,x2,x3...), detecter
				s'il y a des correlations entre ces grandeurs d'entrées
			</p>
			<h2>Evaluer tous les types de sources d'incertitudes</h2>
			<p>
				Il faut rechercher toutes les sources d'incertitudes possibles.
				Cela peut etre :{' '}
				<ul>
					<li>erreur de lecture</li>
					<li>erreur d'etalonnage</li>
					<li>erreur de modelisation</li>
					<li>erreur d'homogeneité</li>
					<li>erreur de derive de l'etalon....</li>
				</ul>
				pour chaque composante d'incertitude, il faut connaitre soit
				l'ecart type experimental (via des répétitions de mesure) soit
				la loi (a priori) de probabilité de cette composante (loi
				uniforme, normale,triangulaire,...)
			</p>
			<h2>Evaluer l'incertitude composée</h2>
			<p>
				Pour evaluer l'incertitude composée, il y a 2 methodes:{' '}
				<ul>
					<li>
						{' '}
						la methode analytique : l'incertitude composée est la
						racine carrée de la somme des variances (composante
						d'incertitude^2){' '}
					</li>
					<li>
						{' '}
						la methode de simulation numérique 'Monte-carlo' : on
						simule aléatoirement des tirages (via un programme
						informatique) dans la densité de probabilité de chaque
						composante d'entrée. Puis on calcule via le modele
						mathématique les valeurs obtenues de la grandeur de
						sortie, ce qui permet de construire la distribution
						empirique du mesurande et d'en déduire l'esperance
						mathematique, l'ecart*type et l'intervalle le plus court
						au niveau de la probabilté spécifié{' '}
					</li>
				</ul>
			</p>
		</div>
	);
};
export default function App() {
	const [nbrInterventionsEnCours, setNbrInterventionsEnCours] =
		useState(null);
	console.log('render from app');
	useEffect(() => {
		window.electron.ipcRenderer.on('lectureDBinterventions', (arg) => {
			console.log('lectureDBinterventions from front');
			console.log(arg);
			setNbrInterventionsEnCours(arg.length);
		});

		window.electron.ipcRenderer.lectureDBinterventions();
	}, []);

	const handleInterventionsEnCoursFromMAJdeca = (data) => {
		console.log('data from app');
		console.log(data);
	};
	return (
		<Router>
			{/* <div> */}
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
					<li>
						<Link to="/incertitude">Incertitudes de mesure</Link>
					</li>
					<li>
						<Link to="/MAJdeca">Recherche ECME</Link>
					</li>
					<li>
						<Link to="/interventionsEnCours">
							Interventions en cours
							<span className="spanNbrInterventions">
								{nbrInterventionsEnCours}
							</span>
						</Link>
					</li>
				</ul>
			</nav>

			{/* A <Switch> looks through its children <Route>s and
					renders the first one that matches the current URL. */}
			<Switch>
				<Route path="/mesure">
					<Mesure />
				</Route>
				<Route path="/incertitude">
					<Incertitude />
				</Route>
				<Route path="/gestionEtalons">
					<GestionEtalons />
				</Route>
				<Route path="/interventionsEnCours">
					<InterventionAtelier />
				</Route>
				<Route path="/MAJdeca">
					<RechercheDeca />
				</Route>
				<Route path="/">
					<Home />
				</Route>
			</Switch>
			{/* </div> */}
		</Router>
	);
}
