const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
      meas() {
      ipcRenderer.send('lectureCalys', 'meas');

    },
      measCont() {
      ipcRenderer.send('lectureCalys', 'measCont');

    },
    meas2() {
      ipcRenderer.send('ecritureCalys', 'meas2');

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
      }
    // },
  },
});
