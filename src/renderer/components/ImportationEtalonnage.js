import React, { useState, useEffect } from 'react';
import { comparer, interpoler } from '../helpers/functionUtilitaire';
import regression from 'regression';
import axios from 'axios';

const ImportationEtalonnage = ({ datasEtalons }) => {
	const [areaValue, setareaValue] = React.useState('');
	const [dateValue, setDateValue] = React.useState('');
	const [numCertificat, setNumCertificat] = React.useState('');
	// const [domaine, setDomaine] = React.useState('');
	const [typeTc, setTypeTc] = React.useState('');
	// const [etalonChoisi, selectionCapteur] = React.useState('');
	const [domaineChoisi, setDomaineChoisi] = useState('');
	const [etalonChoisi, setEtalonChoisi] = useState(null);
	const [domaineUnique, setDomaineUnique] = useState(null);

	let domaine_Unique = [];

	useEffect(() => {
		domaine_Unique = [...new Set(datasEtalons.map((item) => item.domaine))];
		console.log('domaineUnique', domaine_Unique);
		setDomaineUnique(domaine_Unique);
	}, []);

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
	}

	const handleChange = (event) => {
		console.log(event.target.value);
		setEtalonChoisi(event.target.value);
	};
	const handleChangeTC = (event) => {
		console.log(event.target.value);
		setTypeTc(event.target.value);
	};

	console.log('etalonAchoisir', etalonAChoisir);
	const post = (_data) => {
		axios
			.post('http://localhost/API_test/post.php', _data)
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
			console.log(data)
			for (const iterator of data) {
				reference.push(iterator[1]);
				appareil.push(iterator[2]);
				incertitude.push(iterator[7]);
			}
			let dataTraitee = [reference, appareil, incertitude];
			let dataToExport = {
				marquage: etalonChoisi,
				reference: dataTraitee[0],
				appareil: dataTraitee[1],
				incertitude: dataTraitee[2],
				dateEtalonnage: new Date(dateValue).toDateString(),
				numCertificat: numCertificat,
				domaine: domaineChoisi,
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
				marquage: etalonChoisi,
				reference: dataTraitee[0],
				appareil: dataTraitee[1],
				incertitude: dataTraitee[2],
				dateEtalonnage: new Date(dateValue).toDateString(),
				numCertificat: numCertificat,
				domaine: domaineChoisi,
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
		if (etalonChoisi.includes('PRIM')) {
			console.log("coucou")
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
		} else if (etalonChoisi.includes('SEC02C')) {
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
		} else if (etalonChoisi.includes('2257775−AMS')) {
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
		}  else if (etalonChoisi.includes('TCK03')) {
			let rows = areaValue.split('\n');
			console.log(rows);
			for (const row of rows) {
				let dataLigne = row.split(' ');
				for (let i = 0; i < dataLigne.length; i++) {
					if (dataLigne[i].includes(',')) {
						dataLigne[i] = dataLigne[i].replace(',', '.');
					}
				}
				console.log(dataLigne);
				let dataligneCalys150 = [];
				dataligneCalys150[0] = parseFloat(dataLigne[0]);
				dataligneCalys150[1] = parseFloat(dataLigne[1]);
				dataligneCalys150[2] = parseFloat(dataLigne[3]);

				data.push(dataligneCalys150);
			}
			console.log(data)
			dataToExport = handleCalysData(data);
		}
		console.log('dataToExport');
		console.log(dataToExport);
		dataToExport.ptsEtalonnage = JSON.stringify({
			reference: dataToExport.reference,
			appareil: dataToExport.appareil,
			incertitude: dataToExport.incertitude,
		});

		console.log(dataToExport);
		post(dataToExport);
	};

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'stretch',
				width: '100%',
			}}
		>
			{/* TODO Mettre les infos dans un state unique et changer le text selon les conditions (et maj le CSS des etapes) */}
			{domaineChoisi ? null : (
				<div
					style={{
						position: 'absolute',
						left: '80%',
						top: '50%',
						background: 'red',
					}}
				>
					Choisir domaine SVP
				</div>
			)}
			{!etalonChoisi && domaineChoisi ? (
				<div
					style={{
						position: 'absolute',
						left: '80%',
						top: '50%',
						background: 'red',
					}}
				>
					Choisir etalon ou creer un nouveau SVP
				</div>
			) : null}
			{etalonChoisi && domaineChoisi && !areaValue ? (
				<div
					style={{
						position: 'absolute',
						left: '80%',
						top: '50%',
						background: 'red',
					}}
				>
					Coller vos données
				</div>
			) : null}
			{etalonChoisi && domaineChoisi && areaValue && !dateValue ? (
				<div
					style={{
						position: 'absolute',
						left: '80%',
						top: '50%',
						background: 'red',
					}}
				>
					Entrer la date
				</div>
			) : null}
			{etalonChoisi &&
			domaineChoisi &&
			areaValue &&
			dateValue &&
			!numCertificat ? (
				<div
					style={{
						position: 'absolute',
						left: '80%',
						top: '50%',
						background: 'red',
					}}
				>
					Numero de cv?
				</div>
			) : null}
			{etalonChoisi &&
			domaineChoisi &&
			areaValue &&
			dateValue &&
			numCertificat ? (
				<div
					style={{
						position: 'absolute',
						left: '80%',
						top: '50%',
						background: 'red',
					}}
				>
					Bravo
				</div>
			) : null}

			<div className="classListeDomaine">
				{domaineUnique ? (
					<>
						{domaineUnique.map((e) => (
							<div
								className={
									domaineChoisi == e
										? 'classDomaineActif'
										: 'classDomaine'
								}
								onClick={() => {
									setDomaineChoisi(e);
									setEtalonChoisi(null);
								}}
							>
								{e}
							</div>
						))}
						<span style={{ position: 'absolute', right: '5%' }}>
							<label>nom domaine</label>
							<input
								style={{ width: 200, height: 50 }}
								type="text"
								value={domaineChoisi}
								onChange={(event) =>
									setDomaineChoisi(event.target.value)
								}
								placeholder="A renseigner si nouveau domaine..."
							></input>
						</span>
					</>
				) : null}
			</div>

			<div className="classListeEtalon">
				{domaineChoisi ? (
					<>
						{etalonAChoisir.map((e) => (
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
						))}
						{etalonAChoisir ? (
							<span style={{ position: 'absolute', right: '5%' }}>
								<label>nom etalon</label>
								<input
									style={{ width: 200, height: 50 }}
									type="text"
									value={etalonChoisi}
									onChange={(event) =>
										setEtalonChoisi(event.target.value)
									}
									placeholder="A renseigner si nouveau capteur..."
								></input>
							</span>
						) : null}
					</>
				) : null}
			</div>

			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					background: 'lightgrey',
					alignItems: 'baseline',
					paddingLeft: '10%',
					marginTop: '2%',
					paddingTop: '2%',
					flex: 1,
					flexDirection: 'column',
				}}
			>
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
				<span>
					<label>Date d'etalonnage</label>
					<input
						type="date"
						value={dateValue}
						onChange={(event) => setDateValue(event.target.value)}
						placeholder="date d'etalonnage jj/mm/aaaa"
					></input>
				</span>
				<span>
					<label>Numero de certificat</label>
					<input
						type="text"
						value={numCertificat}
						onChange={(event) =>
							setNumCertificat(event.target.value)
						}
						placeholder="N°FR....."
					></input>
				</span>
				{/* <div className="form-check">
					<form>
						<input
							className="form-check-input"
							type="radio"
							id="1"
							value="SEC02C"
							checked={
								etalonChoisi == 'SEC02C' ? true : false
							}
							onChange={handleChange}
						/>
						SEC02C
						<input
							className="form-check-input"
							type="radio"
							id="2"
							value="PRIM02"
							checked={
								etalonChoisi == 'PRIM02' ? true : false
							}
							onChange={handleChange}
						/>
						PRIM02
						<input
							className="form-check-input"
							type="radio"
							id="3"
							value="PRIM03"
							checked={
								etalonChoisi == 'PRIM03' ? true : false
							}
							onChange={handleChange}
						/>
						PRIM03
						<input
							className="form-check-input"
							type="radio"
							id="4"
							value="2257775−AMS"
							checked={
								etalonChoisi == '2257775−AMS'
									? true
									: false
							}
							onChange={handleChange}
						/>
						2257775−AMS
					</form>
				</div> */}
				{etalonChoisi == '2257775−AMS' ? (
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
				)}
				{/* <span> */}
				<button onClick={getValue}>Valider</button>
				{/* <button
					type="button"
					onClick={() => setImportation(!importation)}
					// onClick={() =>startMyInterval() }
				>
					<span role="img" aria-label="books">
						📚
					</span>
					importation d'un nouvel etalonnage ?
				</button></span> */}
			</div>
		</div>
	);
};

export default ImportationEtalonnage;
