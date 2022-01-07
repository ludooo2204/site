const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electron', {
	dialog: {},
	ipcRenderer: {


		meas() {
			ipcRenderer.send('lectureCalys', 'MEAS?\n');
		},
		ecritureCalys(four) {
			console.log(four);
			ipcRenderer.send('ecritureCalys', four);
		},
		initCalys() {
			ipcRenderer.send('initCalys');
		},
		remote() {
			ipcRenderer.send('remote');
		},
		ChoixCalys(com) {
			ipcRenderer.send('ChoixCalys',com);
		},
		changementTypeTc(com) {
			ipcRenderer.send('changementTypeTc',com);
		},
		lectureDB() {
			ipcRenderer.send('lectureDB');
		},
		modeLocal() {
			ipcRenderer.send('modeLocal');
		},
		lectureDBecme() {
			ipcRenderer.send('lectureDBecme');
		},
		updateDBSimulations() {
			ipcRenderer.send('updateDBSimulations');
		},
		ouvrirFichier(data) {
			ipcRenderer.send('ouvrirFichier',data);
		},
		insertdbECME(data) {
			ipcRenderer.send('insertdbECME', data);
		},
		insererDBinterventions(data) {
			ipcRenderer.send('insererDBinterventions', data);
		},
		insererDBSimulations() {
			ipcRenderer.send('insererDBSimulations');
		},
		updateDBinterventions(data) {
			ipcRenderer.send('updateDBinterventions', data);
		},
		lectureDBinterventions() {
			ipcRenderer.send('lectureDBinterventions');
		},
		effacerDBinterventions(data) {
			ipcRenderer.send('effacerDBinterventions',(data));
		},
		effacerDB() {
			ipcRenderer.send('effacerDB');
		},
		insererDB(data) {
			console.log('insererDB');
			ipcRenderer.send('insererDB', data);
		},
		xlsBainDrop(pathFile) {
			ipcRenderer.send('xlsBainDrop', pathFile);
		},
		xlsECMEDrop(pathFile) {
			ipcRenderer.send('xlsECMEDrop', pathFile);
		},
		dbPtsMesures(data) {
			ipcRenderer.send('dbPtsMesures', data);
		},
		lectureDbPtsMesures(four,date,listePointsCorrigés) {
			ipcRenderer.send('lectureDbPtsMesures', four,date,listePointsCorrigés);
		},
		xls() {
			ipcRenderer.send('xls');
		},
		openXlsForSimulation() {
			ipcRenderer.send('openXlsForSimulation');
		},
		ouvrirRapport(etalonChoisi) {
			ipcRenderer.send('ouvrirRapport',etalonChoisi);
		},
		on(channel, func) {
			// const validChannels = ['ipc-example'];
			// if (validChannels.includes(channel)) {
			// Deliberately strip event as it includes `sender`
			ipcRenderer.on(channel, (event, ...args) => func(...args));
			// }
		},
		once(channel, func) {
			// const validChannels = ['ipc-example'];
			// if (validChannels.includes(channel)) {
			// Deliberately strip event as it includes `sender`
			ipcRenderer.once(channel, (event, ...args) => func(...args));
		},
		// },
	},
});
