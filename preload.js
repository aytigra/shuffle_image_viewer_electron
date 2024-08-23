const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('electronAPI', {
  onImageOpen: (callback) => ipcRenderer.on('open-image', (_event, prevImagePath, imagePath, nextImagePath) => callback(prevImagePath, imagePath, nextImagePath)),
  onNextImageOpen: (callback) => ipcRenderer.on('open-next-image', (_event, nextImagePath) => callback(nextImagePath)),
  onPrevImageOpen: (callback) => ipcRenderer.on('open-prev-image', (_event, prevImagePath) => callback(prevImagePath)),
  onImageDeleted: (callback) => ipcRenderer.on('image-deleted', (_event, imagePath) => callback(imagePath)),
})
