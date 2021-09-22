const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electron', {
	dialog: {},
	ipcRenderer: {


		meas() {
			ipcRenderer.send('lectureCalys', 'meas');
		},
		ecriture(four) {
			console.log(four);
			ipcRenderer.send('ecritureCalys', four);
		},
		initCalys() {
			ipcRenderer.send('initCalys');
		},
		ChoixCalys(com) {
			ipcRenderer.send('ChoixCalys',com);
		},
		lectureDB() {
			ipcRenderer.send('lectureDB');
		},
		lectureDBecme() {
			ipcRenderer.send('lectureDBecme');
		},
		insertdbECME(data) {
			ipcRenderer.send('insertdbECME', data);
		},
		insererDBinterventions(data) {
			ipcRenderer.send('insererDBinterventions', data);
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
		xls() {
			ipcRenderer.send('xls');
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
