import { enable } from 'debug';
import React, { useState, useEffect } from 'react';
import { Line, Scatter, defaults } from 'react-chartjs-2';
import regression from 'regression';
import { comparer, interpoler } from 'renderer/helpers/functionUtilitaire';
import ImportationEtalonnage from './ImportationEtalonnage';
import axios from 'axios';

const GestionEtalons = () => {
	const [dataEtalon, setDataEtalon] = useState(null);
	const [datasEtalons, setDatasEtalons] = useState(null);
	const [dataChart, setDataChart] = useState(null);
	const [dataChartHistorique, setDataChartHistorique] = useState(null);
	const [domaineUnique, setDomaineUnique] = useState(null);
	const [domaineChoisi, setDomaineChoisi] = useState('');
	const [etalonChoisi, setEtalonChoisi] = useState('');
	const [typeTC, setTypeTC] = useState(null);
	const [etalonnageChoisi, setEtalonnageChoisi] = useState(null);
	const [typeTcChoisi, setTypeTcChoisi] = useState('K');
	const [index, setIndex] = useState(0);
	const [importation, setImportation] = useState(false);
	const [interpolation, setInterpolation] = useState(false);
	const [resultatModelisation, setResultatModelisation] = useState(null);
	const [nbrMesure, setNbrMesure] = useState(1000);
	const [echelleChartMin, setEchelleChartMin] = useState(null);
	const [echelleChartMax, setEchelleChartMax] = useState(null);
	const [historiqueChart, setHistoriqueChart] = useState(false);
	const [dataHistorique, setDataHistorique] = useState(null);
	const [modelisationChoisie, setModelisationChoisie] = useState({
		ordre: 4,
		precision: 10,
	});
	// const [etalonAChoisir, setEtalonAChoisir] = useState();

	let dataForChart,
		optionsForChart,
		dataForChartHistorique,
		optionsForChartHistorique;
	if (dataChart) {
		// console.log('dataChart', dataChart[1]);
		// console.log('max ', Math.max(...dataChart[1]) + 10);
		// let maxChoisi = Math.max(...dataChart[1]) *1.1;
		let minChoisi =
			Math.min(...dataChart[1]) >= 0
				? Math.min(...dataChart[1]) * 0.9
				: Math.min(...dataChart[1]) * 1.1;
		let maxChoisi =
			Math.max(...dataChart[1]) >= 0
				? Math.max(...dataChart[1]) * 1.1
				: Math.max(...dataChart[1]) * 0.9;
		dataForChart = {
			labels: dataChart[0],
			// labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					type: 'line',
					label: 'ecart Etalonnage',
					data: dataChart[1],
					// data: [0, 1, 2, 3, 4, 5],
					fill: false,
					tension: 0.1,
					backgroundColor: '#070913',
					borderColor: '#070913',
				},
				{
					type: 'line',
					label: 'Ecart après modélisation',
					data: etalonChoisi.includes('225') ? null : dataChart[2],
					tension: 0.2,
					// data: [0, 1, 2, 3, 4, 5],
					fill: false,
					backgroundColor: '#e61c1c',
					borderColor: '#da232ccc',
				},
				{
					type: 'line',
					label: 'IE+ k=2',
					data: dataChart[3],
					tension: 0.2,
					// data: [0, 1, 2, 3, 4, 5],
					fill: '+1',
					backgroundColor: 'rgb(165,165,165,0.4)',
					borderColor: 'transparent',
					// backgroundColor: '#e61c1c',
					// borderColor: '#da232ccc',
				},
				{
					type: 'line',
					label: 'IE- k=2',
					data: dataChart[4],
					tension: 0.2,
					backgroundColor: 'rgb(165,165,165,0.4)',
					borderColor: 'transparent',
					// data: [0, 1, 2, 3, 4, 5],
					// fill: '-1',
					// backgroundColor: '#e61c1c',
					// borderColor: '#da232ccc',
					// backgroundColor: 'rgb(165,165,165)',
					// borderColor: 'transparent',
				},
				{
					type: 'scatter',
					label: 'simulation Ie',
					data: dataChart[5],
					borderColor: '#000015',
					pointRadius: 1,
					pointStyle: 'point',
					borderColor: '#423f6b',
					events: ['click'],
					pointStyle: 'crossRot',
				},
			],
		};
		optionsForChart = {
			// events:['click'],
			plugins: {
				tooltip: {
					filter: function (tooltip) {
						// console.log(tooltip)
						console.log(tooltip.dataset.label);
						if (tooltip.dataset.label.includes('simulation'))
							return false;
						else return true;
					},
				},
			},

			scales: {
				y: {
					min: echelleChartMin ? echelleChartMin : null,
					max: echelleChartMax ? echelleChartMax : null,
					// max: maxChoisi,
					// min: minChoisi,
					// max: domaineChoisi=="VIDE"?maxChoisi:0.7,
					// min: domaineChoisi=="VIDE"?minChoisi:-0.7,
					// max: -10,
					// min: -50,
					ticks: {
						beginAtZero: false,
					},
				},
				x: {
					min: Math.min(...dataChart[0]),
					type: domaineChoisi == 'VIDE' ? 'logarithmic' : 'linear',
					ticks:
						domaineChoisi == 'VIDE'
							? {
									callback: function (value, index, values) {
										//	console.log(value.toExponential(0))
										return value.toExponential(0);
										// return this.getLabelForValue(value).toExponential(
										// 	0
										// );
									},
							  }
							: {},
				},
			},
		};
	}
	if (dataChartHistorique) {
		console.log(dataChartHistorique)
		dataForChartHistorique = {
			labels: dataChartHistorique[0],
			// labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					type: 'line',
					label: 'historique',
					data: dataChartHistorique[1],
					// data: [0, 1, 2, 3, 4, 5],
					fill: false,
					tension: 0.1,
					backgroundColor: '#070913',
					borderColor: '#070913',
				},
			],
		};
		optionsForChartHistorique = {
			// events:['click'],
			plugins: {
				tooltip: {
					callbacks:{
					label: function (tooltip) {
						// console.log(tooltip)
						console.log(dataHistorique[tooltip.dataIndex][1]);
						console.log(tooltip.dataset.label);
						// .includes('simulation'))
						// 	return false;
						// else
						 return new Date(dataHistorique[tooltip.dataIndex][1]).toLocaleDateString('FR-fr');
					},
				}
				},
			},

			scales: {
				y: {
					min: -1,
					max: 1,
					// // max: maxChoisi,
					// // min: minChoisi,
					// // max: domaineChoisi=="VIDE"?maxChoisi:0.7,
					// // min: domaineChoisi=="VIDE"?minChoisi:-0.7,
					// // max: -10,
					// // min: -50,
					// ticks: {
					// 	beginAtZero: false,
					// },
				},
				x: {
					max: 1.0002,
					min: 0.9998,
					type:  'linear',
					// ticks:
					// 	domaineChoisi == 'VIDE'
					// 		? {
					// 				callback: function (value, index, values) {
					// 					//	console.log(value.toExponential(0))
					// 					return value.toExponential(0);
					// 					// return this.getLabelForValue(value).toExponential(
					// 					// 	0
					// 					// );
					// 				},
					// 		  }
					// 		: {},
				},
			},
		};
	}

	let domaine_Unique = [];
	useEffect(() => {
		let dataChartHistoriqueTempX = [];
		let dataChartHistoriqueTempY = [];
		let dataChartHistoriqueTempLabel = [];
		if (dataHistorique) {
			console.log(dataHistorique);
			dataHistorique.forEach((e) => {
				dataChartHistoriqueTempX.push(e[0][0]);
				dataChartHistoriqueTempY.push(e[0][1]);
				dataChartHistoriqueTempLabel.push(e[1]);
			});
			setDataChartHistorique([
				dataChartHistoriqueTempX,
				dataChartHistoriqueTempY,
				dataChartHistoriqueTempLabel,
			]);
		}
	}, [dataHistorique,typeTC]);
	useEffect(() => {
		if (dataChartHistorique) {
			console.log(dataChartHistorique);
		}
	}, [dataChartHistorique]);
	useEffect(() => {
		fetch('http://localhost/API_test/get.php')
			.then((reponse) => reponse.json())
			.then((reponse) => {
				console.log(reponse);
				console.log(reponse);

				setDatasEtalons(reponse);
				domaine_Unique = [
					...new Set(reponse.map((item) => item.domaine)),
				];
				console.log('domaineUnique', domaine_Unique);
				setDomaineUnique(domaine_Unique);
			});
		document.addEventListener('keydown', (e) => {
			if (e.key == 'ArrowRight') {
				setIndex((index) => {
					return index + 1;
				});
			}
			if (e.key == 'ArrowLeft') {
				setIndex((index) => {
					if (index > 0) return index - 1;
					else return index;
				});
			}
		});
	}, []);
	useEffect(() => {
		console.log(index);
		console.log(etalonnageAChoisirUnique);
		if (
			etalonnageAChoisirUnique &&
			index < etalonnageAChoisirUnique.length
		) {
			setEtalonnageChoisi(etalonnageAChoisirUnique[index]);
		}
	}, [index]);
	useEffect(() => {
		let ptsEtalonnage;
		if (dataEtalon) {
			console.log(dataEtalon[0]);
			console.log(dataEtalon);
			if (dataEtalon[0].marquage.includes('22577')) {
				setTypeTC(['K', 'S', 'N']);
				ptsEtalonnage = JSON.parse(
					dataEtalon.filter((e) => e.typeTc == typeTcChoisi)[0]
						.ptsEtalonnage
				);
				// setTypeTcChoisi('K')
			} else ptsEtalonnage = JSON.parse(dataEtalon[0].ptsEtalonnage);
			// console.log(JSON.parse(dataEtalon[0].modelisation));
			let erreurCumulé = 0;
			let resultat;
			let dataForChartTemp = [[], [], [], [], []];
			// setModelisationChoisie();
			let dataParsedForRegression = [];
			if (domaineChoisi == 'VIDE') {
				for (let i = 0; i < ptsEtalonnage.appareil.length; i++) {
					dataParsedForRegression.push([
						Math.log10(ptsEtalonnage.appareil[i]),
						Math.log10(ptsEtalonnage.reference[i]),
						ptsEtalonnage.incertitude[i],
					]);
				}

				resultat = regression.polynomial(dataParsedForRegression, {
					order: Number(modelisationChoisie.ordre),
					precision: Number(modelisationChoisie.precision),
				});

				for (const iterator of dataParsedForRegression) {
					// console.log(iterator);
					let appareilValue = Math.pow(10, iterator[0]);
					let referenceValue = Math.pow(10, iterator[1]);
					let Ie = iterator[2];

					let appareilCorrigé = Math.pow(
						10,
						resultat.predict(iterator[0])[1]
					);
					dataForChartTemp[0].push(appareilValue);
					dataForChartTemp[1].push(
						((appareilValue - referenceValue) * 100) /
							referenceValue
					);
					dataForChartTemp[2].push(
						((appareilValue - appareilCorrigé) * 100) /
							appareilCorrigé
					);

					dataForChartTemp[3].push(
						Ie +
							((appareilValue - referenceValue) * 100) /
								referenceValue
					);
					dataForChartTemp[4].push(
						((appareilValue - referenceValue) * 100) /
							referenceValue -
							Ie
					);

					// const erreurRelativeEtalonnage =
					// 	((referenceValue - appareilCorrigé) * 100) /
					// 	referenceValue;
					// erreurCumulé +=
					// 	erreurRelativeEtalonnage * erreurRelativeEtalonnage;
				}
			} else if (etalonChoisi.includes('2257')||etalonChoisi.includes('TCK03')) {
				for (let i = 0; i < ptsEtalonnage.appareil.length; i++) {
					dataParsedForRegression.push([
						ptsEtalonnage.appareil[i],
						ptsEtalonnage.reference[i],
						ptsEtalonnage.incertitude[i],
					]);
				}
				// resultat = regression.linear(dataParsedForRegression, {
				// 	// order: 4,
				// 	precision: 10,
				// });
				resultat = regression.polynomial(dataParsedForRegression, {
					order: Number(modelisationChoisie.ordre),
					precision: Number(modelisationChoisie.precision),
				});
				for (const iterator of dataParsedForRegression) {
					let appareilValue = iterator[0];
					let referenceValue = iterator[1];
					let Ie = iterator[2];
					let appareilCorrigé = resultat.predict(iterator[0])[1];
					dataForChartTemp[0].push(appareilValue);
					dataForChartTemp[1].push(appareilValue - referenceValue);
					dataForChartTemp[2].push(appareilValue - appareilCorrigé);
					dataForChartTemp[3].push(
						Ie + appareilValue - referenceValue
					);
					dataForChartTemp[4].push(
						appareilValue - referenceValue - Ie
					);
				}
			}

			console.log('R2 ', resultat.r2);
			console.log('RESULTAT ', resultat);
			console.log(
				'appareil,ecart etalonnage, ecart modelisé, Ie+,Ie- ',
				dataForChartTemp
			);
			setResultatModelisation(resultat);
			// ###########################################################
			// ###########################################################
			// ###########################################################
			// ###########################################################
			function randNormal(mean = 2, std = 0.2) {
				let u = 0,
					v = 0;
				while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
				while (v === 0) v = Math.random();
				let num =
					Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

				return num * std + mean;
			}
			let meanCherché = 1;
			let stdCherché = 0.2;
			let sum = 0;
			let sum2 = 0;
			// let nbrMesure = 10000;
			let arrayY = [];
			let arrayX = [];
			let arrayZ = [];
			let arrayXY = [];
			console.log('mean visé = ', meanCherché);
			console.log('std visé = ', stdCherché);

			console.log(ptsEtalonnage);
			let coupleAppareilReference = [];
			let coupleReferenceIncertitude = [];
			for (let i = 0; i < ptsEtalonnage.reference.length; i++) {
				console.log(ptsEtalonnage.reference[i]);
				coupleAppareilReference.push([
					ptsEtalonnage.appareil[i],
					ptsEtalonnage.reference[i],
				]);
				coupleReferenceIncertitude.push([
					ptsEtalonnage.reference[i],
					ptsEtalonnage.incertitude[i],
				]);
			}

			// console.log(iterator)

			console.log('coupleAppareilReference', coupleAppareilReference);
			console.log(
				'coupleReferenceIncertitude',
				coupleReferenceIncertitude
			);
			let nbrDansEcartType = [];
			for (let index = 0; index < nbrMesure; index++) {
				let maxLog = Math.log10(Math.max(...dataForChartTemp[0]));
				let minLog = Math.log10(Math.min(...dataForChartTemp[0]));
				// console.log(minLog)
				// console.log(maxLog)
				const valeurAleatDataAppareil =
					domaineChoisi == 'VIDE'
						? Math.pow(
								10,
								Math.random() * (maxLog - minLog) + minLog
						  )
						: Math.random() *
								(Math.max(...dataForChartTemp[0]) -
									Math.min(...dataForChartTemp[0])) +
						  Math.min(...dataForChartTemp[0]);
				const YcorrespondantParInterpolation = interpoler(
					valeurAleatDataAppareil,
					coupleAppareilReference
				);
				const IncertitudecorrespondantParInterpolation = interpoler(
					valeurAleatDataAppareil,
					coupleReferenceIncertitude
				);

				// console.log('valeur Aleat Appareil', valeurAleatDataAppareil);
				// console.log(
				// 	'Y correspondant Par Interpolation',
				// 	YcorrespondantParInterpolation
				// );
				// console.log(
				// 	'ecart relatif pour vide',
				// 	(valeurAleatDataAppareil - YcorrespondantParInterpolation)*100/YcorrespondantParInterpolation
				// );
				let Y;

				// TODO revoir cette partie pour simaultion incertitude VIDE
				if (domaineChoisi == 'VIDE') {
					Y = randNormal(
						((valeurAleatDataAppareil -
							YcorrespondantParInterpolation) *
							100) /
							YcorrespondantParInterpolation,
						IncertitudecorrespondantParInterpolation
					);
				} else {
					Y = randNormal(
						valeurAleatDataAppareil -
							YcorrespondantParInterpolation,
						IncertitudecorrespondantParInterpolation
					);
				}

				let moyenneAvisé = 0.2;
				let EcartType = 0.11;
				const testRandNormal = randNormal(moyenneAvisé, EcartType);
				if (
					testRandNormal < moyenneAvisé + 2 * EcartType &&
					testRandNormal > moyenneAvisé - 2 * EcartType
				) {
					nbrDansEcartType.push(testRandNormal);
				}
				// console.log('x= ', valeurAleatDataAppareil, 'y = ', Y);
				arrayXY.push({
					x: valeurAleatDataAppareil,
					y: Y,
					// z: Ycorrespondant - valeurAleatDataAppareil,
				});
			}

			console.log(
				'% dedans pour k=1',
				(nbrDansEcartType.length * 100) / nbrMesure
			);
			console.log(
				'% dedans pour k=1',
				(nbrDansEcartType.length * 100) / nbrMesure
			);
			console.log(arrayXY);
			dataForChartTemp.push(arrayXY);
			console.log(dataForChartTemp);
			// ###########################################################
			// ###########################################################
			// ###########################################################
			// ###########################################################

			setDataChart(dataForChartTemp);
			console.log(defaults);
		}
	}, [dataEtalon, modelisationChoisie, nbrMesure, typeTcChoisi]);
	useEffect(() => {
		if (etalonChoisi) {
			setEtalonnageChoisi(etalonnageAChoisirUnique[0]);
		}
	}, [etalonChoisi]);
	useEffect(() => {
		if (etalonChoisi) {
			const allo = datasEtalons.filter(
				(e) =>
					new Date(e.dateEtalonnage).toLocaleDateString('FR-fr') ==
						new Date(etalonnageChoisi).toLocaleDateString(
							'FR-fr'
						) && e.marquage == etalonChoisi
			);
			setDataEtalon(allo);
		}
	}, [etalonnageChoisi]);

	let etalonAChoisir;
	let etalonnageAChoisir;
	let etalonnageAChoisirUnique;
	if (datasEtalons) {
		const etalonParDomaineChoisi = datasEtalons.filter(
			(e) => e.domaine == domaineChoisi
		);
		etalonAChoisir = [
			...new Set(etalonParDomaineChoisi.map((item) => item.marquage)),
		];
		// if (etalonChoisi.includes('225777')) {}
		etalonnageAChoisir = etalonParDomaineChoisi.filter(
			(e) => e.marquage == etalonChoisi
		);
		etalonnageAChoisirUnique = [
			...new Set(
				etalonnageAChoisir.map((item) =>
					new Date(item.dateEtalonnage).getTime()
				)
			),
		];

		// console.log('etalonnageAChoisir', etalonnageAChoisir);
		etalonnageAChoisirUnique = etalonnageAChoisirUnique.sort().reverse();
		// console.log('etalonnageAChoisirUnique', etalonnageAChoisirUnique);
	}

	const handleChangeOrder = (event) => {
		setModelisationChoisie({
			...modelisationChoisie,
			ordre: event.target.value,
		});
	};
	const handleChangePrecision = (event) => {
		setModelisationChoisie({
			...modelisationChoisie,
			precision: event.target.value,
		});
	};
	const handleChangeNbrMesure = (event) => {
		setNbrMesure(event.target.value);
	};
	const historique = (event) => {
		setHistoriqueChart(true);
		console.log('historique');
		let historiqueData = datasEtalons.filter(
			(e) => e.marquage == etalonChoisi
		);
		console.log(etalonChoisi.includes('225'));
		if (etalonChoisi.includes('225'))
			historiqueData = historiqueData.filter(
				(e) => e.typeTc == typeTcChoisi
			);
		console.log(historiqueData);
		let _dataHistorique = [];
		historiqueData.forEach((element) => {
			console.log(element)
			const coefs = JSON.parse(element.modelisation);
			_dataHistorique.push([coefs.equation, element.dateEtalonnage]);
		});
		_dataHistorique=(_dataHistorique.sort((a,b)=> {return new Date(b[1]).getTime()-new Date(a[1]).getTime()}))
		setDataHistorique(_dataHistorique);
	};
	const handleChangeMax = (event) => {
		console.log(event.target.value);
		setEchelleChartMax(event.target.value);
		// setNbrMesure(event.target.value);
	};
	const handleChangeMini = (event) => {
		console.log(event.target.value);
		// setNbrMesure(event.target.value);
		setEchelleChartMin(event.target.value);
	};

	const handleChangeInterpolation = () => {
		// console.log(interpolation);
		setInterpolation(!interpolation);
	};
	const updateModelisation = () => {
		console.log({ ...resultatModelisation, interpolation: interpolation });
		const _data = { ...resultatModelisation, interpolation: interpolation };
		const dataToExport = {
			modelisation: JSON.stringify(_data),
			id: dataEtalon[0].id,
		};

		console.log(dataToExport);
		axios
			.post(
				'http://localhost/API_test/update.php',
				JSON.stringify(dataToExport)
			)
			.then((response) => {
				console.log(response);
				window.alert('ca a marché ');
				// window.location.reload();
			})
			.catch((error) => {
				console.log(JSON.stringify(error));
			});
	};

	if (!importation) {
		return (
			<div style={{ width: '80VW', height: '80vH', margin: '0 auto' }}>
				<div className="classListeDomaine">
					{domaineUnique
						? domaineUnique.map((e) => (
								<div
									className={
										domaineChoisi == e
											? 'classDomaineActif'
											: 'classDomaine'
									}
									onClick={() => setDomaineChoisi(e)}
								>
									{e}
								</div>
						  ))
						: null}
				</div>
				<div className="classListeEtalon">
					{etalonAChoisir
						? etalonAChoisir.map((e) => (
								<div
									className={
										etalonChoisi == e
											? 'classEtalonActif'
											: 'classEtalon'
									}
									onClick={() => setEtalonChoisi(e)}
									style={{ marginRight: 10 }}
								>
									{e}
								</div>
						  ))
						: null}
				</div>
				{etalonnageAChoisirUnique
					? etalonnageAChoisirUnique.map((e) => (
							<span
								key={e}
								className={
									etalonnageChoisi == e
										? 'classEtalonnageActif'
										: 'classEtalonnage'
								}
								onClick={() => {
									setEtalonnageChoisi(e);
								}}
								style={{ marginRight: 20 }}
							>
								{new Date(e).toLocaleDateString('FR-fr')}
							</span>
					  ))
					: null}
				<br />
				{typeTC &&
				dataEtalon[0].marquage.includes('225') &&
				domaineChoisi == 'TEMPERATURE'
					? typeTC.map((e) => (
							<span
								key={e}
								className={
									typeTcChoisi == e
										? 'classEtalonnageActif'
										: 'classEtalonnage'
								}
								onClick={() => {
									setTypeTcChoisi(e);
								}}
								style={{ marginRight: 20 }}
							>
								{e}
							</span>
					  ))
					: null}
				<h1>{etalonChoisi}</h1>
				{dataHistorique ? <h4>{console.log(dataHistorique)}</h4> : null}
				{/* {modelisationChoisie && JSON.stringify(modelisationChoisie)} */}
				<div
					style={{
						background: '#eceeed76',
						width: '90%',
						margin: '0 auto',
						marginTop: 10,
						marginBottom: 10,
					}}
				>
					{historiqueChart ? (
						<Line
							data={dataForChartHistorique}
							options={optionsForChartHistorique}
							width={600}
							height={200}
						/>
					) : (
						<Scatter
							data={dataForChart}
							options={optionsForChart}
							width={600}
							height={200}
							// options={{y:{min:echelleChartMin,max:echelleChartMax}}}
						/>
					)}
					{/* <Line
						data={dataForChart}
						options={optionsForChart}
						// width={600}
					/> */}
				</div>
				<div>
					la modelisation a t elle eté validé ?{' '}
					{dataEtalon && etalonChoisi.includes('225')
						? dataEtalon.filter(
								(e) => e.typeTc == typeTcChoisi
						  )[0] &&
						  dataEtalon.filter((e) => e.typeTc == typeTcChoisi)[0]
								.modelisation != null
							? 'yes'
							: 'no'
						: dataEtalon && dataEtalon[0].modelisation != null
						? 'Yes'
						: 'no'}
					<br />
					<label>
						Correction par interpolation ? :
						<input
							type="checkbox"
							value={interpolation}
							onChange={handleChangeInterpolation}
						/>
					</label>
					<label>
						degré de modélisation ? :
						<input
							type="number"
							value={modelisationChoisie.ordre}
							onChange={handleChangeOrder}
							min="1"
						/>
					</label>
					<br />
					<label>
						nbr de chiffres representatif ? :
						<input
							type="number"
							value={modelisationChoisie.precision}
							onChange={handleChangePrecision}
							min="1"
						/>
					</label>
					<br />
					<label>
						nbr d'itérations pour simulation Incertitude ? :
						<input
							type="number"
							value={nbrMesure}
							step="4000"
							onChange={handleChangeNbrMesure}
							min="1"
						/>
					</label>
					<label>
						min-max pour echelle du graphe :
						<input
							type="number"
							value={echelleChartMin}
							onChange={handleChangeMini}
						/>
						<input
							type="number"
							value={echelleChartMax}
							onChange={handleChangeMax}
						/>
					</label>
				</div>
				{resultatModelisation && resultatModelisation.string}
				<br />
				{resultatModelisation && 'R2 = ' + resultatModelisation.r2}
				<br />
				<button
					type="button"
					onClick={() => setImportation(!importation)}
					// onClick={() =>startMyInterval() }
				>
					<span role="img" aria-label="books">
						📚
					</span>
					importation d'un nouvel etalonnage ?
				</button>
				<button
					type="button"
					onClick={() => updateModelisation()}
					// onClick={() =>startMyInterval() }
				>
					<span role="img" aria-label="books">
						📚
					</span>
					Validation de la modelisation?
				</button>
				<button
					type="button"
					onClick={() => historique()}
					// onClick={() =>startMyInterval() }
				>
					<span role="img" aria-label="books">
						📚
					</span>
					historique
				</button>
			</div>
		);
	} else {
		return (
			<div
				style={{
					width: '90VW',
					height: '90vH',
					display: 'flex',
					margin: '0 auto',
					background: 'green',
					justifyContent: 'center',
				}}
			>
				<ImportationEtalonnage datasEtalons={datasEtalons} />
			</div>
		);
	}
};

export default GestionEtalons;
