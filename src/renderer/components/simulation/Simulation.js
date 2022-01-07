import { gsap } from 'gsap';
import CalysSvg from './calys.js';
import { foursData } from './fourData';
import { interpoler } from '../../helpers/functionUtilitaire';

import React, { useState, useEffect, useRef } from 'react';
const Simulation = () => {
	const [pointsMesure, setPointsMesure] = useState(0);
	const [isPortSelected, setIsPortSelected] = useState(false);
	const [voieChoisie, setVoieChoisie] = useState(false);
	const [actif, setActif] = useState(false);
	const [ports, setPorts] = useState(null);
	const [saisieManuelle, setSaisieManuelle] = useState(false);
	const [listePoints, setListePoints] = useState([]);
	const [correctionEtIncertitudes, setCorrectionEtIncertitudes] =
		useState(null);
	// const [listePointsCorrigé, setListePointsCorrigé] = useState([]);
	const [listePointsCorrigéK, setListePointsCorrigéK] = useState(null);
	const [listePointsCorrigéN, setListePointsCorrigéN] = useState(null);
	const [listePointsCorrigéS, setListePointsCorrigéS] = useState(null);
	const [listePointsIncertitudeK, setListePointsIncertitudeK] =
		useState(null);
	const [listePointsIncertitudeN, setListePointsIncertitudeN] =
		useState(null);
	const [listePointsIncertitudeS, setListePointsIncertitudeS] =
		useState(null);
	const [calysChoisi, setCalysChoisi] = useState('2257775-AMS');
	const [fourChoisi, setFourChoisi] = useState(null);
	const [test, setTest] = useState(0);
	const [voieValidée, setVoieValidée] = useState([]);
	const myRef = useRef(null);
	const TL = useRef(null);

	useEffect(() => {
		// window.electron.ipcRenderer.openXlsForSimulation();
		window.electron.ipcRenderer.initCalys();
		window.electron.ipcRenderer.on('initCalys', (arg) => {
			console.log('initCalys');
			// console.log(arg);
			setPorts(arg);
		});

		fetch('http://localhost/API_test/get.php')
			.then((reponse) => reponse.json())
			.then((reponse) => {
				// console.log(reponse);
				const datasCalys = reponse.filter(
					(e) =>
						e.marquage.includes('2257775') ||
						e.marquage.includes('412191')
				);

				datasCalys.forEach((element) => {
					element.dateEtalonnage = new Date(
						element.dateEtalonnage
					).getTime();
				});
				const dateEtalonnageEnCours = {
					...datasCalys.sort(
						(a, b) => b.dateEtalonnage - a.dateEtalonnage
					)[0],
				}.dateEtalonnage;
				// etalonnageEnCours.dateEtalonnage=new Date(etalonnageEnCours.dateEtalonnage).toLocaleDateString('FR-fr')

				const etalonnageEnCours = datasCalys.filter(
					(e) => e.dateEtalonnage == dateEtalonnageEnCours
				);
				console.log(etalonnageEnCours);
				// ########################Interpolation K
				let dataParsedForRegressionK = [];
				let coupleReferenceIncertitudeK = [];
				let coupleAppareilReferenceK = [];
				let ptsEtalonnageK = JSON.parse(
					etalonnageEnCours.filter((e) => e.typeTc == 'K')[0]
						.ptsEtalonnage
				);
				for (let i = 0; i < ptsEtalonnageK.reference.length; i++) {
					coupleAppareilReferenceK.push([
						ptsEtalonnageK.appareil[i],
						ptsEtalonnageK.reference[i],
					]);
					coupleReferenceIncertitudeK.push([
						ptsEtalonnageK.reference[i],
						ptsEtalonnageK.incertitude[i],
					]);
				}

				// ########################Interpolation N

				let dataParsedForRegressionN = [];
				let coupleReferenceIncertitudeN = [];
				let coupleAppareilReferenceN = [];
				let ptsEtalonnageN = JSON.parse(
					etalonnageEnCours.filter((e) => e.typeTc == 'N')[0]
						.ptsEtalonnage
				);
				for (let i = 0; i < ptsEtalonnageN.reference.length; i++) {
					coupleAppareilReferenceN.push([
						ptsEtalonnageN.appareil[i],
						ptsEtalonnageN.reference[i],
					]);
					coupleReferenceIncertitudeN.push([
						ptsEtalonnageN.reference[i],
						ptsEtalonnageN.incertitude[i],
					]);
				}
				// ########################Interpolation S

				let dataParsedForRegressionS = [];
				let coupleReferenceIncertitudeS = [];
				let coupleAppareilReferenceS = [];
				let ptsEtalonnageS = JSON.parse(
					etalonnageEnCours.filter((e) => e.typeTc == 'S')[0]
						.ptsEtalonnage
				);
				for (let i = 0; i < ptsEtalonnageS.reference.length; i++) {
					coupleAppareilReferenceS.push([
						ptsEtalonnageS.appareil[i],
						ptsEtalonnageS.reference[i],
					]);
					coupleReferenceIncertitudeS.push([
						ptsEtalonnageS.reference[i],
						ptsEtalonnageS.incertitude[i],
					]);
				}

				setListePointsCorrigéK(coupleAppareilReferenceK);
				setListePointsCorrigéN(coupleAppareilReferenceN);
				setListePointsCorrigéS(coupleAppareilReferenceS);
				setListePointsIncertitudeK(coupleReferenceIncertitudeK);
				setListePointsIncertitudeN(coupleReferenceIncertitudeN);
				setListePointsIncertitudeS(coupleReferenceIncertitudeS);
			});
		window.electron.ipcRenderer.on('lectureCalys', (arg) => {
			console.log('lectureCalys from simu');
			console.log(arg);
		});

		window.electron.ipcRenderer.on('ecritureCalys', (arg) => {
			// eslint-disable-next-line no-console
			console.log('arg from ecritureCalys');
			console.log(arg);
			console.log(test);
		});
		return () => {
			window.electron.ipcRenderer.modeLocal();
		};
	}, []);

	useEffect(() => {
		if (actif) {
			TL.current = gsap.timeline({ repeat: -1 }).to(myRef.current, {
				duration: 1.5,
				x: 600,
				y: -200,
				rotate: 20,
				opacity: 0,
				transformOrigin: 'center center',
				ease: 'back-in(1.7)',
				delay: 1.5,
			});
			TL.current.play();
			// if (!actif) TL.current.kill()
			// .to(myRef.current,{duration:1,scale:2})
			return () => {
				TL.current.kill;
			};
		}
		// TL.current.pause()
	}, [actif]);

	// useEffect(() => {
	// 	actif ? TL.current.play() : TL.current.pause();
	// }, [actif]);

	const handleClick = () => {
		console.log('coucou');
		setActif(true);
	};
	const handleInputManuelCalys = () => {
		setSaisieManuelle(!saisieManuelle);
	};
	const handleValeurInputManuelCalys = (e) => {
		window.electron.ipcRenderer.ecritureCalys(e.target.value);
	};

	useEffect(() => {
		if (fourChoisi) {
			console.log(fourChoisi);
			// ([...fourChoisi.points])
			let dataCorrectionEtIncertitudes = [];
			for (const iterator of fourChoisi.voiesDeMesure) {

				let dataCorrectionEtIncertitudesParVoie = [];

				dataCorrectionEtIncertitudesParVoie.push('etalon corrigé '+iterator.name)
				if (iterator.name=="SECURITE") {dataCorrectionEtIncertitudesParVoie.push(
					Math.round(
						interpoler(fourChoisi.sécurité, listePointsCorrigéS) * 100
					) / 100
				);
			} else {
				for (const iterator2 of fourChoisi.points) {
					if (iterator.typeTc == 'K') {
						dataCorrectionEtIncertitudesParVoie.push(
							Math.round(
								interpoler(iterator2, listePointsCorrigéK) * 100
							) / 100
						);
					}
					if (iterator.typeTc == 'S') {
						dataCorrectionEtIncertitudesParVoie.push(
							Math.round(
								interpoler(iterator2, listePointsCorrigéS) * 100
							) / 100
						);
					}
					if (iterator.typeTc == 'N') {
						dataCorrectionEtIncertitudesParVoie.push(
							Math.round(
								interpoler(iterator2, listePointsCorrigéN) * 100
							) / 100
						);
					}
				}
				}
				dataCorrectionEtIncertitudes.push(dataCorrectionEtIncertitudesParVoie)


				//incertitude
				let dataIncertitudesParVoie = [];

				dataIncertitudesParVoie.push('incertitude étalon '+iterator.name)
				if (iterator.name=="SECURITE") {dataIncertitudesParVoie.push(
					Math.round(
						interpoler(fourChoisi.sécurité, listePointsIncertitudeS) * 100
					) / 100
				);
			} else {
				for (const iterator2 of fourChoisi.points) {
					if (iterator.typeTc == 'K') {
						dataIncertitudesParVoie.push(
							Math.round(
								interpoler(iterator2, listePointsIncertitudeK) * 100
							) / 100
						);
					}
					if (iterator.typeTc == 'S') {
						dataIncertitudesParVoie.push(
							Math.round(
								interpoler(iterator2, listePointsIncertitudeS) * 100
							) / 100
						);
					}
					if (iterator.typeTc == 'N') {
						dataIncertitudesParVoie.push(
							Math.round(
								interpoler(iterator2, listePointsIncertitudeN) * 100
							) / 100
						);
					}
				}
				}
				dataCorrectionEtIncertitudes.push(dataIncertitudesParVoie)
			}


console.log('dataCorrectionEtIncertitudes')
console.log(dataCorrectionEtIncertitudes)
			setCorrectionEtIncertitudes(dataCorrectionEtIncertitudes);
		}
	}, [fourChoisi]);

	useEffect(() => {
		if (fourChoisi) {
			console.log('changment point de mesures');
			window.electron.ipcRenderer.ecritureCalys(
				fourChoisi.points[pointsMesure]
			);
		}
	}, [pointsMesure]);

	useEffect(() => {
		if (fourChoisi) {
			setListePoints([]);
			setPointsMesure(0);
			window.electron.ipcRenderer.changementTypeTc(voieChoisie.typeTc);
			window.setTimeout(() => {
				window.electron.ipcRenderer.ecritureCalys(fourChoisi.points[0]);
				console.log('hop point initial');
				handleClick();
			}, 1000);
		}
	}, [voieChoisie]);

	const handlePortChoice = (com) => {
		console.log(com.path);
		setIsPortSelected(true);
		window.electron.ipcRenderer.ChoixCalys(com.path);
	};
	// let listePoints=[]
	const validationMesureIntermediaire = (data) => {
		if (!isNaN(data.index)) {
			listePoints[data.index] = data.valeurAppareil;
			console.log('data.index');
			console.log(data.index);
			console.log('fourChoisi.points.length');
			console.log(fourChoisi.points.length);
			if (data.index < fourChoisi.points.length - 1) {
				setPointsMesure((pointsMesure) => pointsMesure + 1);
				setListePoints((listePoints) => [
					...listePoints,
					data.valeurAppareil,
				]);
			}
		} else {
			setListePoints((listePoints) => [
				...listePoints,
				{ sécurité: data.valeurAppareil },
			]);
		}
	};
	const validationMesures = (e) => {
		e.preventDefault();
		console.log("c'est validé!!");
		let mesuresParVoie = {
			four: fourChoisi.name,
			dateEtalonnage: new Date().toLocaleDateString('FR-fr'),
			calysChoisi: calysChoisi,
			voieChoisie: voieChoisie,
			listePoints: listePoints,
		};

		window.electron.ipcRenderer.dbPtsMesures(mesuresParVoie);
		setVoieValidée((voie) => [...voieValidée, voieChoisie.name]);
		setActif(false);
	};
	const handleValidation4Excel = () => {
		window.electron.ipcRenderer.lectureDbPtsMesures(
			fourChoisi,
			// '28/09/2021');
			new Date().toLocaleDateString('FR-fr'),
			correctionEtIncertitudes
		);
	};
	return (
		<>
			{!ports && <h1>AUCUN EQUIPEMENT DE BRANCHE!!</h1>}
			{ports && !isPortSelected && (
				<div
					className={isPortSelected ? 'mainPortsOpaque' : 'mainPorts'}
				>
					{ports.map((e) => (
						<li onClick={() => handlePortChoice(e)}>
							{e.path} - {e.productId} - {e.manufacturer}
						</li>
					))}
				</div>
			)}
			{ports && isPortSelected && (
				<div className="mainSimulation">
					<div className="fourContainer">
						{foursData.map((four, index) => (
							<button
								type="button"
								className={
									fourChoisi
										? fourChoisi.name === four.name
											? 'fourBtn'
											: 'fourBtn desactivé'
										: 'fourBtn'
								}
								onClick={() => {
									console.log('choixFour');
									setFourChoisi(four);
									// setEcmeChoisi(true)
									window.electron.ipcRenderer.remote();
								}}
							>
								<span role="img" aria-label="books">
									🔥
								</span>
								{four.name}
							</button>
						))}
					</div>
					<div className="voieContainer">
						{fourChoisi &&
							fourChoisi.voiesDeMesure.map((voie, index) => (
								<button
									type="button"
									className={
										voieValidée.includes(voie.name)
											? 'btnVoieValidée'
											: voieChoisie
											? voieChoisie.name === voie.name
												? 'voieBtn'
												: 'voieBtn desactivé'
											: 'voieBtn'
									}
									onClick={() => {
										console.log('choixVoie');
										console.log(voie);
										setVoieChoisie(voie);
										window.electron.ipcRenderer.remote();
									}}
								>
									<span role="img" aria-label="books"></span>
									{voie.name}
									{voie.name.includes('SECURITE')
										? ' ' + fourChoisi.sécurité + ' °C'
										: ''}
								</button>
							))}
					</div>
					<div className="calysContainer">
						<CalysSvg />

						{!saisieManuelle ? (
							<h1 ref={myRef} className="valeur">
								{fourChoisi &&
									actif &&
									!voieChoisie.name.includes('SECURITE') &&
									fourChoisi.points[pointsMesure] + '°C'}
								{fourChoisi &&
									actif &&
									voieChoisie.name.includes('SECURITE') &&
									fourChoisi.sécurité &&
									fourChoisi.sécurité + '°C'}
							</h1>
						) : (
							<input
								step={0.1}
								className="inputValeurManuelle"
								onChange={handleValeurInputManuelCalys}
								type="number"
							></input>
						)}
					</div>
					<div className="pointsDeMesureContainer">
						{fourChoisi &&
							voieChoisie &&
							!voieChoisie.name.includes('SECURITE') &&
							fourChoisi.points.map((e, index) => (
								<div className="ptsMesures">
									{e}
									<br />
									{voieChoisie.typeTc == 'K'
										? Math.round(
												interpoler(
													e,
													listePointsCorrigéK
												) * 100
										  ) / 100
										: voieChoisie.typeTc == 'N'
										? Math.round(
												interpoler(
													e,
													listePointsCorrigéN
												) * 100
										  ) / 100
										: Math.round(
												interpoler(
													e,
													listePointsCorrigéS
												) * 100
										  ) / 100}
									<input
										style={{ marginLeft: '1rem' }}
										placeholder="saisir la valeur..."
										onBlur={(e) => {
											validationMesureIntermediaire({
												valeurAppareil: e.target.value,
												index: index,
											});
										}}
										onFocus={(e) => (e.target.value = '')}
										autoFocus={index == 0}
										type="number"
									/>
								</div>
							))}
						{fourChoisi &&
							voieChoisie &&
							voieChoisie.name.includes('SECURITE') && (
								<div className="ptsMesures">
									{fourChoisi.sécurité}
									<input
										style={{ marginLeft: '1rem' }}
										placeholder="saisir la valeur..."
										onBlur={(e) => {
											validationMesureIntermediaire({
												valeurAppareil: e.target.value,
												index: 'securité',
											});
										}}
										onFocus={(e) => (e.target.value = '')}
										autoFocus
										type="number"
									/>
								</div>
							)}
						{fourChoisi && voieChoisie && (
							<button onClick={validationMesures} type="submit">
								valider les mesures?
							</button>
						)}
						{fourChoisi && voieChoisie && (
							<div>
								<button onClick={handleInputManuelCalys}>
									Saisie manuelle ?
								</button>
							</div>
						)}
						{fourChoisi && voieChoisie && (
							<div>
								<button onClick={handleValidation4Excel}>
									Exporter vers excel ?
								</button>
							</div>
						)}
					</div>
					<div className="choixCalysContainer">
						<label>Choix de l'étalon :</label>
						<div>
							<button
								className={
									calysChoisi == '2257775-AMS'
										? null
										: 'desactivé'
								}
								onClick={() => setCalysChoisi('2257775-AMS')}
							>
								calys150
							</button>
						</div>
						<div>
							<button
								className={
									calysChoisi == '2257775-AMS'
										? 'desactivé'
										: null
								}
								onClick={() => setCalysChoisi('412191')}
							>
								calys100
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default Simulation;
