import React, { useEffect, useState } from 'react';
import InterventionItem from './InterventionItem';

const InterventionAtelier = () => {
	const [dbECME, setDbECME] = useState(null);
	const [value, setValue] = useState(0); // integer state
	const [itemsList, setItemsList] = useState(null);
	const [tagOperateurList, setTagOperateurList] = useState(null);
	// let newItems = [];
	// let newItems4db = [];
	useEffect(() => {
		console.log('toto');
		window.electron.ipcRenderer.on('lectureDBinterventions', (arg) => {

			setItemsList(arg);
		})

		window.electron.ipcRenderer.lectureDBinterventions();


		window.electron.ipcRenderer.lectureDBecme();

		window.electron.ipcRenderer.on('lectureDBecme', (arg) => {

			setDbECME(arg);
		});
	}, [value]);
	useEffect(() => {
		if (dbECME){

			let operateurUnique = [
				...new Set(dbECME.map((item) => item.operateur)),
			].sort();
			let tagUnique = [...new Set(dbECME.map((item) => item.tag))].sort();
			setTagOperateurList({tagUnique,operateurUnique})
		}

	}, [dbECME])
	// function useForceUpdate(){
	// 	setValue(value => value + 1); // update the state to force render
	// }
	return (
		<div className="divInterventionAtelier">
			{(itemsList && tagOperateurList) &&
				itemsList.map((e) => (
					<InterventionItem
						data={e}
						tagOperateurList={tagOperateurList}
						// forceUpdate={useForceUpdate}
						/>
				))}
		</div>
	);
};

export default InterventionAtelier;

