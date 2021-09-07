import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import regression from 'regression';
import { comparer } from 'renderer/helpers/functionUtilitaire';
import ImportationEtalonnage from './ImportationEtalonnage';

const GestionEtalons = () => {
	const [dataEtalon, setDataEtalon] = useState(null);
	const [datasEtalons, setDatasEtalons] = useState(null);
	const [dataChart, setDataChart] = useState(null);
	const [domaineUnique, setDomaineUnique] = useState(null);
	const [domaineChoisi, setDomaineChoisi] = useState('');
	const [etalonChoisi, setEtalonChoisi] = useState('');
	const [etalonnageChoisi, setEtalonnageChoisi] = useState(null);
	const [index, setIndex] = useState(0);
	const [importation, setImportation] = useState(false);
	// const [etalonAChoisir, setEtalonAChoisir] = useState();

	let dataForChart, optionsForChart;
	if (dataChart) {
		// console.log('dataChart', dataChart[1]);
		// console.log('max ', Math.max(...dataChart[1]) + 10);
		let maxChoisi = Math.max(...dataChart[1]) + 10;
		let minChoisi = Math.min(...dataChart[1]) - 10;
		dataForChart = {
			labels: dataChart[0],
			// labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					label: 'ecart Etalonnage',
					data: dataChart[1],
					// data: [0, 1, 2, 3, 4, 5],
					fill: false,
					tension: 0.1,
					backgroundColor: '#070913',
					borderColor: '#070913',
				},
				{
					label: 'Ecart après modélisation',
					data: dataChart[2],
					tension: 0.2,
					// data: [0, 1, 2, 3, 4, 5],
					fill: false,
					backgroundColor: '#e61c1c',
					borderColor: '#da232ccc',
				},
				// {
				// 	label: 'Ie',
				// 	data: dataEtalon.incertitude,
				// 	tension:0.2,
				// 	// data: [0, 1, 2, 3, 4, 5],
				// 	fill: false,
				// 	backgroundColor: '#e61c1c',
				// 	borderColor: '#da232ccc',
				// },
			],
		};

		optionsForChart = {
			scales: {
				y: {
					max: maxChoisi,
					min: minChoisi,
					// max: -10,
					// min: -50,
					ticks: {
						beginAtZero: false,
					},
				},
				x: {
					ticks: {
						callback: function (value, index, values) {
							// console.log(values)
							return this.getLabelForValue(value).toExponential(
								0
							);
						},
					},
				},
			},
		};
	}

	let domaine_Unique = [];
	useEffect(() => {
		console.log('index change!');
	}, [index]);
	useEffect(() => {
		fetch('http://localhost/API_test/get.php')
			.then((reponse) => reponse.json())
			.then((reponse) => {
				console.log(reponse);
				setDatasEtalons(reponse);
				domaine_Unique = [
					...new Set(reponse.map((item) => item.domaine)),
				];
				console.log('domaineUnique', domaine_Unique);
				setDomaineUnique(domaine_Unique);
			});
		document.addEventListener('keydown', (e) => {
			console.log('keydown');
			if (e.key == 'ArrowRight') {
				setIndex((index) => {
					// if (index<2)	return index + 1;
					// else return index
					return index + 1;
				});
			}
			if (e.key == 'ArrowLeft') {
				console.log(index);
				setIndex((index) => {
					if (index > 0) return index - 1;
					else return index;
				});
			}
			// setEtalonnageChoisi(etalonnageAChoisirUnique[2])
		});
	}, []);
	useEffect(() => {
		console.log(index);
		console.log(etalonnageAChoisirUnique);
		if (
			etalonnageAChoisirUnique &&
			index < etalonnageAChoisirUnique.length
		) {
			// console.log('etalonnageAChoisirUnique', etalonnageAChoisirUnique);
			setEtalonnageChoisi(etalonnageAChoisirUnique[index]);
		}
	}, [index]);
	useEffect(() => {
		if (dataEtalon) {
			// console.log(dataEtalon);
			// console.log(dataEtalon[0].ptsEtalonnage);
			const ptsEtalonnage = JSON.parse(dataEtalon[0].ptsEtalonnage);
			let dataParsedForRegression = [];
			for (let i = 0; i < ptsEtalonnage.appareil.length; i++) {
				dataParsedForRegression.push([
					Math.log10(ptsEtalonnage.appareil[i]),
					Math.log10(ptsEtalonnage.reference[i]),
				]);
			}
			const resultat = regression.polynomial(dataParsedForRegression, {
				order: 4,
				precision: 10,
			});
			// console.log('resultat de modelisation ', resultat);
			// console.log(resultat.points);

			let erreurCumulé = 0;
			let dataForChartTemp = [[], [], []];
			for (const iterator of dataParsedForRegression) {
				// console.log(iterator);
				let appareilValue = Math.pow(10, iterator[0]);
				let referenceValue = Math.pow(10, iterator[1]);
				let appareilCorrigé = Math.pow(
					10,
					resultat.predict(iterator[0])[1]
				);
				dataForChartTemp[0].push(appareilValue);
				dataForChartTemp[1].push(
					((appareilValue - referenceValue) * 100) / referenceValue
				);
				dataForChartTemp[2].push(
					((appareilValue - appareilCorrigé) * 100) / appareilCorrigé
				);
				// console.log(referenceValue);
				// console.log(appareilCorrigé);
				const erreurRelativeEtalonnage =
					((referenceValue - appareilCorrigé) * 100) / referenceValue;
				// console.log(erreurRelativeEtalonnage, ' %');
				erreurCumulé +=
					erreurRelativeEtalonnage * erreurRelativeEtalonnage;
			}
			console.log(
				'erreur de modelisation relative cumulé ',
				Math.sqrt(erreurCumulé / dataParsedForRegression.length)
			);
			console.log('R2 ', resultat.r2);
			console.log(
				'appareil,ecart etalonnage et ecart modelisé ',
				dataForChartTemp
			);
			setDataChart(dataForChartTemp);
		}
	}, [dataEtalon]);
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
					new Date(etalonnageChoisi).toLocaleDateString('FR-fr')
			);
			// console.log(allo);
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
								style={{ margin: 10 }}
							>
								{e}
							</div>
					  ))
					: null}
			</div>
			<br />
			{etalonChoisi}

					{etalonChoisi?<button
						type="button"
						onClick={() => setImportation(!importation)}
						// onClick={() =>startMyInterval() }
					>
						<span role="img" aria-label="books">
							📚
						</span>
						importation d'un nouvel etalonnage ?
					</button>:null}
			{etalonnageAChoisirUnique
				? etalonnageAChoisirUnique.map((e) => (
						<span
							className={
								etalonnageChoisi == e
									? 'classEtalonnageActif'
									: 'classEtalonnage'
							}
							onClick={() => {
								setEtalonnageChoisi(e);
							}}
							style={{ margin: 20 }}
						>
							{new Date(e).toLocaleDateString('FR-fr')}
						</span>
				  ))
				: null}
			<h1>{etalonChoisi}</h1>

			{!importation ? (
				<div
					style={{
						background: '#eceeed76',
						width: '90%',
						margin: '0 auto',
						marginTop: 20,
						marginBottom: 20,
					}}
				>
					<Line
						data={dataForChart}
						options={optionsForChart}
						// width={600}
					/>
				</div>
			) : (
				<ImportationEtalonnage etalon={etalonChoisi} domaine={domaineChoisi} />
			)}
		</div>
	);
};

export default GestionEtalons;
