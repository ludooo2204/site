import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import regression from 'regression';

const GestionEtalons = () => {
	const [dataEtalon, setDataEtalon] = useState(null);
	const [datasEtalons, setDatasEtalons] = useState(null);
	const [dataChart, setDataChart] = useState(null);
	const [domaineUnique, setDomaineUnique] = useState(null);
	const [domaineChoisi, setDomaineChoisi] = useState('');
	const [etalonChoisi, setEtalonChoisi] = useState('');
	// const [etalonAChoisir, setEtalonAChoisir] = useState();

	let dataForChart, optionsForChart;
	if (dataChart) {
		dataForChart = {
			labels: dataChart[0],
			// labels: [0, 1, 2, 3, 4, 5],
			datasets: [
				{
					label: 'ecart Etalonnage',
					data: dataChart[1],
					// data: [0, 1, 2, 3, 4, 5],
					fill: false,
					backgroundColor: '#070913',
					borderColor: 'rgba(00, 99, 132, 0.8)',
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
					max: -10,
					min: -50,
					ticks: {
						beginAtZero: false,
						max: 50,
						min: -50,
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
		fetch('http://localhost/API_test/get.php')
			.then((reponse) => reponse.json())
			.then((reponse) => {
				console.log(reponse);
				setDatasEtalons(reponse);
				// const domaineFiltree = reponse.filter((e) => (e).domaine == 'VIDE');
				// console.log(domaineFiltree)
				domaine_Unique = [
					...new Set(reponse.map((item) => item.domaine)),
				];
				console.log('domaineUnique', domaine_Unique);
				setDomaineUnique(domaine_Unique);
				reponse.forEach((element) => {
					console.log(element);
					if (element.id == 10) {
						console.log(element);
						setDataEtalon(element);
					}
				});
			});
	}, []);

	useEffect(() => {
		if (dataEtalon) {
			console.log(dataEtalon);
			console.log(dataEtalon.ptsEtalonnage);
			const ptsEtalonnage = JSON.parse(dataEtalon.ptsEtalonnage);
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
			console.log('resultat de modelisation ', resultat);
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
	let etalonAChoisir;
	if (datasEtalons) {
		const etalonParDomaineChoisi = datasEtalons.filter(
			(e) => e.domaine == domaineChoisi
		);
		etalonAChoisir = [
			...new Set(etalonParDomaineChoisi.map((item) => item.marquage)),
		];
	}
	return (
		<div style={{ width: '80VW', height: '80vH' }}>
			{domaineUnique
				? domaineUnique.map((e) => (
						<h1 onClick={() => setDomaineChoisi(e)}>{e}</h1>
				  ))
				: null}
			{/* {dataEtalon? (JSON.stringify(dataEtalon)):null} */}
			{domaineChoisi}
			<br />


			{/* domaine_Unique = [...new Set(reponse.map((item) => (item).domaine))]; */}
			{etalonAChoisir
				? etalonAChoisir.map((e) => <span onClick={()=>setEtalonChoisi(e)} style={{margin:10}}>{e}</span>)
				: null}
				<h1>{etalonChoisi}</h1>
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
		</div>
	);
};

export default GestionEtalons;
