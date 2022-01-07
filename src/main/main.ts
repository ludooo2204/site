/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
const fs=require('fs')

let Datastore = require('nedb'),
	db = new Datastore({ filename: 'data.db', autoload: true }),
	dbEcme = new Datastore({ filename: 'dbEcme.db', autoload: true }),
	dbSimulations = new Datastore({
		filename: 'dbSimulations.db',
		autoload: true,
	}),
	dbInterventions = new Datastore({
		filename: 'dbInterventions.db',
		autoload: true,
	}),
	dbPtsMesures = new Datastore({
		filename: 'dbPtsMesures.db',
		autoload: true,
	});

const Readline = require('@serialport/parser-readline');
const serialport = require('serialport');
// console.log(serialport);
const XLSX = require('xlsx');
// const port
export default class AppUpdater {
	constructor() {
		log.transports.file.level = 'info';
		autoUpdater.logger = log;
		autoUpdater.checkForUpdatesAndNotify();
	}
}
// listSerialPorts()
let mainWindow: BrowserWindow | null = null;

let port;
// const port = new serialport('COM11', { baudRate: 115200 });
// const lineStream = port.pipe(new Readline());
// console.log('rem');
// port.write('rem\n');

ipcMain.on('dial', async (event, arg) => {
	dialog.showMessageBox({
		message: 'coucou',
	});
});

ipcMain.on('updateDBSimulations', async (event, arg) => {
	console.log('update', arg);
	dbSimulations.find({}).exec(function (err, docs) {
		for (const iterator of docs) {
			db.find({ marquage: iterator.marquage }).exec(function (
				err2,
				docs2
			) {
				console.log('-');
				if (docs2[0]) {
					if (docs2[0].famille.includes('ENREGISTREUR'))
						console.log(docs2[0].string8);
					if (docs2[0].famille.includes('REGULATEUR'))
						console.log(docs2[0].string9);
				}
			});
		}
	});
	// dbSimulations.find({}).exec(function (err, docs) {
	// 	// docs.forEach(element => {
	// 	// // console.log("element.marquage")
	// 	// // console.log(element.marquage)

	// 	// // dbSimulations.update(
	// 	// // 		{ marquage: arg[0] },
	// 	// // 		{ $set: arg[1] },
	// 	// // 		function (err, numReplaced) {
	// 	// // 			console.log(numReplaced);
	// 	// // 			// The doc #3 has been replaced by { _id: 'id3', planet: 'Pluton' }
	// 	// // 			// Note that the _id is kept unchanged, and the document has been replaced
	// 	// // 			// (the 'system' and inhabited fields are not here anymore)
	// 	// // 		}
	// 	// // 	);

	// 	// });

	// 	event.reply('updateDBSimulations', docs);
	// });
	// dbSimulations.update(
	// 	{ marquage: arg[0] },
	// 	{ $set: arg[1] },
	// 	function (err, numReplaced) {
	// 		console.log(numReplaced);
	// 		// The doc #3 has been replaced by { _id: 'id3', planet: 'Pluton' }
	// 		// Note that the _id is kept unchanged, and the document has been replaced
	// 		// (the 'system' and inhabited fields are not here anymore)
	// 	}
	// );
});
ipcMain.on('insererDBSimulations', async (event, arg) => {
	console.log('insererDBSimulations');
	console.log(arg);
	// dbEcme.find({ tag: /simulation/ }).exec(function (err, docs) {
	// docs is an array containing documents that have name as bigbounty
	// If no document is found, docs is equal to []
	// dbSimulations.insert(docs, function (err, newrec) {
	// 	// Callback is optional
	// 	// newrec is the newly inserted document, including its _id
	// 	// newrec has no key called notToBeSaved since its value was undefined
	// 	console.log(err);
	// 	console.log(newrec);
	// 	event.reply('insererDBSimulations', 'ca a marché ?');
	// });
	// event.reply('lectureSimulations', docs);
	// });
});

ipcMain.on('lectureDB', async (event, arg) => {
	db.find({})
		.sort({ date_prevue: 1 })
		.exec(function (err, docs) {
			// docs is an array containing documents that have name as bigbounty
			// If no document is found, docs is equal to []

			event.reply('lectureDB', docs);
		});
});
ipcMain.on('lectureDBecme', async (event, arg) => {
	console.log('dbEcme');
	dbEcme.find({}).exec(function (err, docs) {
		// docs is an array containing documents that have name as bigbounty
		// If no document is found, docs is equal to []
		event.reply('lectureDBecme', docs);
	});
});
ipcMain.on('lectureDBinterventions', async (event, arg) => {
	console.log('dbEcme');
	dbInterventions.find({}).exec(function (err, docs) {
		// docs is an array containing documents that have name as bigbounty
		// If no document is found, docs is equal to []
		event.reply('lectureDBinterventions', docs);
	});
});
ipcMain.on('effacerDBinterventions', async (event, arg) => {
	console.log('effacerDBinterventions', arg);
	dbInterventions.remove({ marquage: arg }, function (err, numremoved) {
		// numremoved is the number of documents that are removed.
		console.log('numremoved');
		console.log(numremoved);
		console.log(err);
		event.reply('effacerDBinterventions', numremoved);
	});
});
ipcMain.on('updateDBinterventions', async (event, arg) => {
	console.log('update', arg);
	dbInterventions.update(
		{ marquage: arg[0] },
		{ $set: arg[1] },
		function (err, numReplaced) {
			console.log(numReplaced);
			// The doc #3 has been replaced by { _id: 'id3', planet: 'Pluton' }
			// Note that the _id is kept unchanged, and the document has been replaced
			// (the 'system' and inhabited fields are not here anymore)
		}
	);
});
ipcMain.on('insererDBinterventions', async (event, arg) => {
	console.log('insert');
	console.log(arg);
	dbInterventions.insert(arg, function (err, newrec) {
		// Callback is optional
		// newrec is the newly inserted document, including its _id
		// newrec has no key called notToBeSaved since its value was undefined
		console.log(err);
		console.log(newrec);
		event.reply('insererDB', 'ca a marché ?');
	});
});
ipcMain.on('dbPtsMesures', async (event, arg) => {
	console.log(arg);
	dbPtsMesures.insert(arg, function (err, newrec) {});
});
ipcMain.on('lectureDbPtsMesures', async (event, four, date,listePointsCorrigés) => {
	dbPtsMesures
		.find({ four: four.name, dateEtalonnage: date })
		.sort({ voieChoisie: 1 })

		.exec(function (err, docs) {
			console.log(docs);
			console.log("listePointsCorrigés")
			console.log(listePointsCorrigés)
			let dataToSave = [];
			docs.forEach((element) => {
				let voie = [];
				voie.push([element.voieChoisie.name]);
				for (const iterator of element.listePoints) {
			if (typeof(iterator) =="string") {
					iterator.replace('.',',')
					voie.push(iterator);
				}
				else console.log("pas string")
				}
				dataToSave.push(voie);
			});
			for (const iterator of listePointsCorrigés) {

				dataToSave.push(iterator)
			}
			let wb = XLSX.utils.book_new();
			let ws = XLSX.utils.aoa_to_sheet(dataToSave);
			XLSX.utils.book_append_sheet(wb, ws, 'Data_simulation');
			XLSX.writeFile(wb, four.name+'.xlsx');
		});
});
ipcMain.on('insertdbECME', async (event, arg) => {
	console.log('insert');
	console.log(arg);
	dbEcme.insert(arg, function (err, newrec) {
		// Callback is optional
		// newrec is the newly inserted document, including its _id
		// newrec has no key called notToBeSaved since its value was undefined
		console.log(err);
		console.log(newrec);
		event.reply('insertdbECME', 'ca a marché !');
	});
});
ipcMain.on('ouvrirFichier', async (arg,data) => {
	console.log('ouvrir');
	console.log(data);
	shell.openPath(
		// 'C:\\Users\\ludovic.vachon\\electron\\serial\\electron-serialport\\vide v2.0.xls'
		'R:\\Laboratoire\\SLC Snecma\\TRAMES\\nouvelle organisation\\En cours d\'utilisation\\Chronomètre & Fréquencemètre\\CHRONOMETRE.xls'
	);

});
ipcMain.on('effacerDB', async (event, arg) => {
	db.remove({ name: 'ludo' }, function (err, numremoved) {
		// numremoved is the number of documents that are removed.
		console.log('numremoved');
		console.log(numremoved);
		event.reply('effacerDB', numremoved);
	});
});

// """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""

async function listSerialPorts() {
	await serialport.list().then((ports, err) => {
		if (ports) {
			mainWindow.webContents.send('initCalys', ports);
		}
		if (err) {
			console.log(err);
		}
	});
}

ipcMain.on('initCalys', async (event, arg) => {
	listSerialPorts();
});

ipcMain.on('ChoixCalys', async (event, com) => {
	console.log('choix calys => ', com);
	if (!port) {
		port = new serialport(com, { baudRate: 115200 });
		console.log('choix CALYS==> rem <===');
		port.write('rem\n', (err) => {
			if (err) console.log('err', err.message);
		});
		console.log('choix CALYS==> *IDN? <===');
		port.write('*IDN?\n', (err) => {
			if (err) console.log('err', err.message);
		});
		const lineStream = port.pipe(new Readline());
		lineStream.on('data', (data) => {
			console.log(' data from linestream');
			console.log(data);
			mainWindow.webContents.send('lectureCalys', data);
			// mainWindow.webContents.send('asynchronous-message', data);
			// dataRecu=data
			// event.reply('ipc-example', data);
			// console.log(JSON.stringify(mainWindow))
		});
		console.log('port conecction');
	} else console.log('port DEJA CHOISI!!!!!!!!!!!!!!!!');
});

ipcMain.on('lectureCalys', async (event, arg) => {
	const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
	console.log('#######arg main lectureCalys');
	console.log(arg);
	port.write(arg, (err) => {
		if (err) console.log('err', err.message);
	});
	console.log(msgTemplate(arg));

	if (arg == 'measCont') {
	}
});
ipcMain.on('remote', async (event, arg) => {
	console.log('port REM');
	port.write('rem\n', (err) => {
		if (err) console.log('err', err.message);
	});
});
ipcMain.on('changementTypeTc', async (event, arg) => {
	console.log('type ', arg);
	port.write('SOUR:tcouple:type ' + arg + '\n', (err) => {
		if (err) console.log('err', err.message);
	});
});

ipcMain.on('ecritureCalys', async (event, arg) => {
	port.write('SOUR ' + arg + '\n');
	event.reply('ecritureCalys', 'couool');
	console.log('Consigne CALYS==> ' + arg + ' <===');
});

ipcMain.on('modeLocal', async (event, arg) => {
	port.write('LOC\n');
	console.log('retour en mode local');
});
ipcMain.on('ouvrirRapport', async (event, etalonChoisi) => {

	console.log('etalonChoisi');
	console.log(etalonChoisi);
dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] })
.then((file)=>{

	fs.readFile(file.filePaths[0], (err, data) => {
		if (err) throw err;
		fs.writeFileSync('C:\\__temp\\'+etalonChoisi[0].marquage+" - "+etalonChoisi[0].dateEtalonnage+".pdf", data, 'binary');
	  });
	console.log(file)
})

});

//''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
ipcMain.on('xls', async (event, arg) => {
	console.log('#######arg main ecritureCalys');
	console.log(arg);
	event.reply('xls', 'couool');
	shell.openPath(
		'C:\\Users\\ludovic.vachon\\electron\\serial\\electron-serialport\\vide v2.0.xls'
	);
});
ipcMain.on('openXlsForSimulation', async (event, arg) => {
	// db.remove({}, { multi: true }, function (err, numremoved) {
	// 	// numremoved is the number of documents that are removed.
	// 	console.log('numremoved');
	// 	console.log(numremoved);
	// 	event.reply('effacerDB', numremoved);
	// });
	var workbook = XLSX.readFile(
		'C:\\Users\\ludovic.vachon\\Desktop\\new Sat\\releveAutomatique.xls',
		{
			// type: 'binary',
		}
	);

	let first_sheet_name = workbook.SheetNames[0];
	let worksheet = workbook.Sheets[first_sheet_name];
	worksheet['A1'].v = 'ca marche!!!!!!!';
	XLSX.writeFile(
		workbook,
		'C:\\Users\\ludovic.vachon\\Desktop\\new Sat\\a.xls'
	);
	// let worksheetJSON = XLSX.utils.sheet_to_json(worksheet);
	// db.insert(worksheetJSON, function (err, newrec) {
	// 	// Callback is optional
	// 	// newrec is the newly inserted document, including its _id
	// 	// newrec has no key called notToBeSaved since its value was undefined
	// 	if (err) console.error(err);
	// 	else console.log('nbr de document inserés = ', newrec.length);
	// 	// event.reply('insererDB', newRec);
	// 	event.reply('xlsBainDrop', worksheetJSON);
	// });
	// event.reply('xlsBain', worksheetJSON);
});
ipcMain.on('xlsBainDrop', async (event, arg) => {
	console.log('#######arg main ecritureCalys');
	console.log('path du document inséré = ', arg);
	db.remove({}, { multi: true }, function (err, numremoved) {
		// numremoved is the number of documents that are removed.
		console.log('numremoved');
		console.log(numremoved);
		event.reply('effacerDB', numremoved);
	});
	var workbook = XLSX.readFile(arg, {
		type: 'binary',
		cellDates: true,
	});

	let first_sheet_name = workbook.SheetNames[0];
	let worksheet = workbook.Sheets[first_sheet_name];

	// let cell = worksheet['A1'].v;
	let worksheetJSON = XLSX.utils.sheet_to_json(worksheet);
	db.insert(worksheetJSON, function (err, newrec) {
		// Callback is optional
		// newrec is the newly inserted document, including its _id
		// newrec has no key called notToBeSaved since its value was undefined
		if (err) console.error(err);
		else console.log('nbr de document inserés = ', newrec.length);
		// event.reply('insererDB', newRec);
		event.reply('xlsBainDrop', worksheetJSON);
	});
	// event.reply('xlsBain', worksheetJSON);
});

ipcMain.on('xlsECMEDrop', async (event, arg) => {
	console.log('#######arg main ecritureCalys');
	console.log('path du document inséré = ', arg);
	dbEcme.remove({}, { multi: true }, function (err, numremoved) {
		// numremoved is the number of documents that are removed.
		console.log('numremoved');
		console.log(numremoved);
		event.reply('effacerDB', numremoved);
	});
	var workbook = XLSX.readFile(arg, {
		type: 'binary',
		cellDates: true,
	});

	let first_sheet_name = workbook.SheetNames[0];
	let worksheet = workbook.Sheets[first_sheet_name];

	// let cell = worksheet['A1'].v;
	let worksheetJSON = XLSX.utils.sheet_to_json(worksheet);
	console.log(worksheetJSON);
	dbEcme.insert(worksheetJSON, function (err, newrec) {
		// Callback is optional
		// newrec is the newly inserted document, including its _id
		// newrec has no key called notToBeSaved since its value was undefined
		if (err) console.error(err);
		else console.log('nbr de document inserés = ', newrec.length);
		// event.reply('insererDB', newRec);
		event.reply('xlsECMEDrop', worksheetJSON);
	});
	// event.reply('xlsBain', worksheetJSON);
});

// lineStream.on('data', (data) => {
// 	console.log(' data from linestream');
// 	console.log(data);
// 	mainWindow.webContents.send('lectureCalys', data);
// 	// mainWindow.webContents.send('asynchronous-message', data);
// 	// dataRecu=data
// 	// event.reply('ipc-example', data);
// 	// console.log(JSON.stringify(mainWindow))
// });

if (process.env.NODE_ENV === 'production') {
	const sourceMapSupport = require('source-map-support');
	sourceMapSupport.install();
}

const isDevelopment =
	process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
	require('electron-debug')();
}

const installExtensions = async () => {
	const installer = require('electron-devtools-installer');
	const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
	const extensions = ['REACT_DEVELOPER_TOOLS'];

	return installer
		.default(
			extensions.map((name) => installer[name]),
			forceDownload
		)
		.catch(console.log);
};

const createWindow = async () => {
	if (
		process.env.NODE_ENV === 'development' ||
		process.env.DEBUG_PROD === 'true'
	) {
		await installExtensions();
	}

	const RESOURCES_PATH = app.isPackaged
		? path.join(process.resourcesPath, 'assets')
		: path.join(__dirname, '../../assets');

	const getAssetPath = (...paths: string[]): string => {
		return path.join(RESOURCES_PATH, ...paths);
	};

	mainWindow = new BrowserWindow({
		show: false,
		width: 1024,
		height: 728,
		icon: getAssetPath('icon.png'),
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	mainWindow.loadURL(resolveHtmlPath('index.html'));

	// @TODO: Use 'ready-to-show' event
	//        https://github.com/electron/electron/blob/main/docs/api/browser-window.md#using-ready-to-show-event
	mainWindow.webContents.on('did-finish-load', () => {
		if (!mainWindow) {
			throw new Error('"mainWindow" is not defined');
		}
		if (process.env.START_MINIMIZED) {
			mainWindow.minimize();
		} else {
			mainWindow.show();
			mainWindow.focus();
			// db.find({ name: 'bigbounty' }, function (err, docs) {
			// 	// docs is an array containing documents that have name as bigbounty
			// 	// If no document is found, docs is equal to []
			// 	mainWindow.webContents.send('lectureDB', docs);
			// });
		}
	});

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

	const menuBuilder = new MenuBuilder(mainWindow);
	menuBuilder.buildMenu();
	// Open urls in the user's browser
	mainWindow.webContents.on('new-window', (event, url) => {
		event.preventDefault();
		shell.openExternal(url);
	});

	// Remove this if your app does not use auto updates
	// eslint-disable-next-line
	// new AppUpdater();
	// const contents = mainWindow.webContents
	// console.log(contents)
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
	// Respect the OSX convention of having the application in memory even
	// after all windows have been closed
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) createWindow();
});

// mainWindow.webContents.send('asynchronous-message', {'SAVED': 'File Saved'});
