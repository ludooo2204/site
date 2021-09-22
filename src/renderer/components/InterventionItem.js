import React, { useEffect, useState } from 'react';
// const {dialog} =window.electron.dialog
const InterventionItem = ({ data, tagOperateurList,forceUpdate }) => {
	const [tag, setTag] = useState(null);
	const [operateur, setOperateur] = useState(null);
	const [isDocumentChecked, setIsDocumentChecked] = useState(data.isDocumentChecked);
	const [isStickerChecked, setIsStickerChecked] = useState(data.isStickerChecked);
	const [isTransfertChecked, setIsTransfertChecked] = useState(data.isTransfertChecked);
	const [actif, setActif] = useState(true)

	let newEntry = {};
	const handleChangeTag = (e) => {
		setTag(e.target.value);
	};
	const handleChangeOperateur = (e) => {
		setOperateur(e.target.value);
	};
	const submitChange = (e) => {
		newEntry.marquage = data.original.marquage;
		newEntry.operateur = operateur;
		newEntry.tag = tag;

		window.electron.ipcRenderer.insertdbECME(newEntry);
	};
const solderInterventions=()=>{
	window.electron.ipcRenderer.effacerDBinterventions(data.original.marquage)
	setActif(!actif)
	// forceUpdate()
}
const handleChangeDocument=(e)=>{
console.log(e.target.checked)
setIsDocumentChecked(!isDocumentChecked)
window.electron.ipcRenderer.updateDBinterventions([data.original.marquage,{isDocumentChecked:e.target.checked}])
}
const handleChangeStickers=(e)=>{
console.log(e.target.checked)
setIsStickerChecked(!isStickerChecked)
window.electron.ipcRenderer.updateDBinterventions([data.original.marquage,{isStickerChecked:e.target.checked}])
}
const handleChangeTransfert=(e)=>{
console.log(e.target.checked)
setIsTransfertChecked(!isTransfertChecked)
window.electron.ipcRenderer.updateDBinterventions([data.original.marquage,{isTransfertChecked:e.target.checked}])
}
	return (
		<>
			<div className={`itemIntervention ${actif?"":"inactif"}`}>
				<div className="itemInterventionInfo">
					<span>
						<div>
							{data.original.marquage +
								' - ' +
								data.original.famille +
								' - ' +
								data.original.service4}
						</div>
						<div>
							{data.tag === 'simulation température'
								? data.original.string6 +
								  ' - ' +
								  data.original.string1 +
								  ' - ' +
								  data.original.string2 +
								  ' - ' +
								  data.original.string8
								: 'rien'}
						</div>
					</span>
					<span>
						{data.tag ? (
							data.tag
						) : (
							<select onChange={handleChangeTag}>
								{tagOperateurList.tagUnique.map((e) => (
									<option value={e}>{e}</option>
								))}
							</select>
						)}
					</span>
					<span>
						{data.operateur ? (
							data.operateur
						) : (
							<select onChange={handleChangeOperateur}>
								{tagOperateurList.operateurUnique.map((e) => (
									<option value={e}>{e}</option>
								))}
							</select>

							// <input
							// 	onChange={handleChangeOperateur}
							// 	type="text"
							// 	// autoFocus
							// 	placeholder="entrer valeur"
							// />
						)}
					</span>
					<span>
						{data.operateur ? null : (
							<button onClick={submitChange}>
								Valider les modifs
							</button>
						)}
					</span>
				</div>
				<div className="itemInterventionInteraction">
					<span>
						<button onClick={()=>{}}>Saisie intervention</button>
					</span>
					<span>
						<input type="checkbox" className="checkIntervention" checked={isStickerChecked} onChange={handleChangeStickers}/>
						etiquette
					</span>
					<span>
						<input type="checkbox" className="checkIntervention" checked={isTransfertChecked} onChange={handleChangeTransfert}/>
						transfert
					</span>
					<span>
						<input type="checkbox" className="checkIntervention" checked={isDocumentChecked} onChange={handleChangeDocument}/>
						document pour TLM
					</span>
					<span>
						<button onClick={solderInterventions}>{actif?"solder intervention":"intervention soldée"}</button>
					</span>
				</div>
			</div>
		</>
	);
};

export default InterventionItem;
