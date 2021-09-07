import React from 'react';
import { comparer, interpoler } from '../helpers/functionUtilitaire';
import regression from 'regression';
import axios from "axios";


const ImportationEtalonnage = ({etalon,domaine}) => {
	const [areaValue, setareaValue] = React.useState('');
	const [dateValue, setDateValue] = React.useState('');
	const [numCertificat, setNumCertificat] = React.useState('');
	// const [domaine, setDomaine] = React.useState('');
	const [typeTc, setTypeTc] = React.useState('');

console.log("etalon", etalon)

	const handleChange = (event) => {
		console.log(event.target.value);
		selectionCapteur(event.target.value);
	};
	const handleChangeTC = (event) => {
		console.log(event.target.value);
		setTypeTc(event.target.value);
	};
	const post = (_data) => {

		axios
			.post("http://localhost/API_test/post.php", _data)
			.then((response) => {
				console.log(response);
				window.location.reload();
			})
			.catch((error) => {
				console.log(JSON.stringify(error));
			});
	};
	const getValue = () => {
		const handleVideData = (data) => {
			for (const iterator of data) {
				reference.push(iterator[1]);
				appareil.push(iterator[2]);
				incertitude.push(iterator[7]);
			}
			let dataTraitee = [reference, appareil, incertitude];
			let dataToExport = {
				marquage: etalon,
				reference: dataTraitee[0],
				appareil: dataTraitee[1],
				incertitude: dataTraitee[2],
				dateEtalonnage: new Date(dateValue).toDateString(),
				numCertificat: numCertificat,
				domaine: domaine,
				ptsEtalonnage: null,
				typeTc: null,
			};

			return dataToExport;
		};
		const handleCalysData = (data) => {
			for (const iterator of data) {
				reference.push(iterator[1]);
				appareil.push(iterator[0]);
				incertitude.push(iterator[2]);
			}
			let dataTraitee = [reference, appareil, incertitude];
			let dataToExport = {
				marquage: etalon,
				reference: dataTraitee[0],
				appareil: dataTraitee[1],
				incertitude: dataTraitee[2],
				dateEtalonnage: new Date(dateValue).toDateString(),
				numCertificat: numCertificat,
				domaine: domaine,
				typeTc: typeTc,
			};
			console.log('dataToexport', dataToExport);
			let dataRegression = [];
			for (const row of data) {
				let coupleRefApp = row.slice(0, 2);
				dataRegression.push(coupleRefApp);
			}

			console.log(dataRegression);
			console.log(interpoler(950, dataRegression).toFixed(2));

			console.log(dataToExport);
			return dataToExport;
		};
		let dataLigneNumber = [];
		let data = [];
		let reference = [];
		let appareil = [];
		let referenceLog = [];
		let appareilLog = [];
		let ecart = [];
		let incertitudePlus = [];
		let incertitudeMoins = [];
		let incertitude = [];
		let dataToExport;
		if (etalon.includes('PRIM')) {
			let rows = areaValue.split('\n');
			console.log(rows);

			for (const row of rows) {
				let dataLigne = row.split(' ');
				dataLigneNumber = [];

				for (let valeur of dataLigne) {
					if (valeur.includes(',')) {
						valeur = valeur.replace(',', '.');
					}

					dataLigneNumber.push(parseFloat(valeur));
				}

				data.push(dataLigneNumber);
			}
			dataToExport = handleVideData(data);
		} else if (etalon.includes('SEC02C')) {
			let rows = areaValue.split('\n');

			for (const row of rows) {
				let dataLigne = row.split(' ');
				let dataligneSec02C = [];
				dataligneSec02C[0] = parseFloat(
					(dataLigne[0].slice(0, -3) + 'E' + dataLigne[1]).replace(
						',',
						'.'
					)
				);
				dataligneSec02C[1] = parseFloat(
					(dataLigne[2].slice(0, -3) + 'E' + dataLigne[3]).replace(
						',',
						'.'
					)
				);
				dataligneSec02C[2] = parseFloat(
					(dataLigne[4].slice(0, -3) + 'E' + dataLigne[5]).replace(
						',',
						'.'
					)
				);
				dataligneSec02C[3] = parseFloat(
					(dataLigne[6].slice(0, -3) + 'E' + dataLigne[7]).replace(
						',',
						'.'
					)
				);
				dataligneSec02C[4] = parseFloat(
					(dataLigne[8].slice(0, -3) + 'E' + dataLigne[9]).replace(
						',',
						'.'
					)
				);
				dataligneSec02C[5] = parseFloat(
					dataLigne[10].replace(',', '.')
				);
				dataligneSec02C[6] = parseFloat(
					(dataLigne[11].slice(0, -3) + 'E' + dataLigne[12]).replace(
						',',
						'.'
					)
				);
				dataligneSec02C[7] = parseFloat(
					dataLigne[13].replace(',', '.')
				);
				dataLigneNumber = [];
				data.push(dataligneSec02C);
			}
			dataToExport = handleVideData(data);
		} else if (etalon.includes('2257775−AMS')) {
			let rows = areaValue.split('\n');
			// console.log(rows);
			for (const row of rows) {
				let dataLigne = row.split(' ');
				for (let i = 0; i < dataLigne.length; i++) {
					if (dataLigne[i].includes(',')) {
						dataLigne[i] = dataLigne[i].replace(',', '.');
					}
				}
				// console.log(dataLigne);
				let dataligneCalys150 = [];
				dataligneCalys150[0] = parseFloat(dataLigne[0]);
				dataligneCalys150[1] = parseFloat(dataLigne[4]);
				dataligneCalys150[2] = parseFloat(dataLigne[9]);
				data.push(dataligneCalys150);
			}
			dataToExport = handleCalysData(data);
		}
		console.log('dataToExport');
		console.log(dataToExport)
		dataToExport.ptsEtalonnage = JSON.stringify({
			reference: dataToExport.reference,
			appareil: dataToExport.appareil,
			incertitude: dataToExport.incertitude,
		});

		console.log(dataToExport);
		post(dataToExport);

	};

	return (
		<div className="nouvelEtalonnage ">
			{/* <ChoixDomaine choixDomaine={(e) => setDomaine(e)} /> */}
			<textarea
				id="textArea"
				autoFocus={true}
				placeholder="placer vos valeurs ici..."
				value={areaValue}
				onChange={(event) => setareaValue(event.target.value)}
				rows="20"
				cols="60"
			></textarea>
			<br />
			<br />
			<label>Date d'etalonnage</label>
			<input
				type="date"
				value={dateValue}
				onChange={(event) => setDateValue(event.target.value)}
				placeholder="date d'etalonnage jj/mm/aaaa"
			></input>
			<br />
			<br />
			<label>Numero de certificat</label>
			<input
				type="text"
				value={numCertificat}
				onChange={(event) => setNumCertificat(event.target.value)}
				placeholder="N°FR....."
			></input>
			<br />
			<br />
			{/* domaine choisi{domaine} */}
			{/* <div>{etalon}</div>
			<div className="form-check">
				<form>
					<input
						className="form-check-input"
						type="radio"
						id="1"
						value="SEC02C"
						checked={etalon == 'SEC02C' ? true : false}
						onChange={handleChange}
					/>
					SEC02C
					<input
						className="form-check-input"
						type="radio"
						id="2"
						value="PRIM02"
						checked={etalon == 'PRIM02' ? true : false}
						onChange={handleChange}
					/>
					PRIM02
					<input
						className="form-check-input"
						type="radio"
						id="3"
						value="PRIM03"
						checked={etalon == 'PRIM03' ? true : false}
						onChange={handleChange}
					/>
					PRIM03
					<input
						className="form-check-input"
						type="radio"
						id="4"
						value="2257775−AMS"
						checked={
							etalon == '2257775−AMS' ? true : false
						}
						onChange={handleChange}
					/>
					2257775−AMS
				</form>
			</div>
			{etalon == '2257775−AMS' ? (
				<div className="form-check">
					<form>
						<input
							className="form-check-input"
							type="radio"
							id="1"
							value="K"
							checked={typeTc == 'K' ? true : false}
							onChange={handleChangeTC}
						/>
						TYPE K
						<input
							className="form-check-input"
							type="radio"
							id="2"
							value="N"
							checked={typeTc == 'N' ? true : false}
							onChange={handleChangeTC}
						/>
						TYPE N
						<input
							className="form-check-input"
							type="radio"
							id="3"
							value="S"
							checked={typeTc == 'S' ? true : false}
							onChange={handleChangeTC}
						/>
						TYPE S
					</form>
				</div>
			) : (
				<div></div>
			)} */}
			<button onClick={getValue}>Valider</button>
		</div>
	);
};

export default ImportationEtalonnage;
