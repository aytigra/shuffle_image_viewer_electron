const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron/main')
const path = require('node:path')
const fs = require('fs')
const { uniq, shuffle } = require('lodash')

app.setName("Shuffle Image Viewer")

const createWindow = () => {
  let playList = readSession()?.playList || []
  let currentImageIndex = readSession()?.currentImageIndex || 0

  const createPlaylist = (fileAndFolderPaths) => {
    playList = shuffle(uniq(filterImageFiles(recursiveReadFiles(fileAndFolderPaths))))
    currentImageIndex = 0
    remeberSession()
    openCurrentImage()
  }

  const remeberSession = () => {
    writeSession({
      playList,
      currentImageIndex
    })
  }

  const deleteCurrentImage = () => {
    const imagePath = imageAtIndex(currentImageIndex)

    if (fs.existsSync(imagePath)) {
      shell.trashItem(imagePath)
      .then(() => {
        playList.splice(currentImageIndex, 1)
        remeberSession()
        openCurrentImage()
        win.webContents.send('image-deleted', imagePath)
      })
    } else {
      alert("This file doesn't exist, cannot delete")
    }
  }

  const nextImageIndex = () => {
    return (currentImageIndex + 1) % playList.length
  }

  const prevImageIndex = () => {
    return (currentImageIndex - 1) % playList.length
  }

  const imageAtIndex = (index) => {
    return playList[index] || 'assets/images/placeholder.svg'
  }

  const openCurrentImage = () => {
    const imagePath = imageAtIndex(currentImageIndex)
    const nextImagePath = imageAtIndex(nextImageIndex())
    const prevImagePath = imageAtIndex(prevImageIndex())

    win.webContents.send('open-image', prevImagePath, imagePath, nextImagePath)
  }

  const openNextImage = () => {
    const nextImagePath = imageAtIndex(nextImageIndex())

    win.webContents.send('open-next-image', nextImagePath)
  }

  const openPrevImage = () => {
    const prevImagePath = imageAtIndex(prevImageIndex())

    win.webContents.send('open-prev-image', prevImagePath)
  }

  const win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
      submenu: [
        {
          label:'Create Playlist',
          accelerator: 'CmdOrCtrl+O',
          click() {
            dialog.showOpenDialog({
              properties: ['openFile', 'multiSelections', 'openDirectory']
            })
            .then((fileObj) => {
              if (!fileObj.canceled) {
                createPlaylist(fileObj.filePaths)
              }
            })
            .catch((err) => {
              console.error(err)
            })
          }
        },
        {
          label:'Clear Playlist',
          click() {
            createPlaylist([])
          }
        },
        {
          label: "Next",
          accelerator: process.platform === 'darwin' ? 'Right' : 'Right',
          click() {
            currentImageIndex = nextImageIndex()
            openNextImage()
          }
        },
        {
          label: "Next",
          accelerator: process.platform === 'darwin' ? 'Space' : 'Space',
          click() {
            currentImageIndex = nextImageIndex()
            openNextImage()
          }
        },
        {
          label: "Previous",
          accelerator: process.platform === 'darwin' ? 'Left' : 'Left',
          click() {
            currentImageIndex = prevImageIndex()
            openPrevImage()
          }
        },
        {
          label: `Open in ${process.platform === 'darwin' ? 'Finder' : 'Explorer'}`,
          click() {
            shell.showItemInFolder(imageAtIndex(currentImageIndex))
          }
        },
        {
          label: `Move to ${process.platform === 'darwin' ? 'Trash' : 'Recycle Bin'}`,
          accelerator: process.platform === 'darwin' ? 'Backspace' : 'Delete',
          click() {
            deleteCurrentImage()
          }
        },
        {
          label: "Close window",
          accelerator: process.platform === 'darwin' ? 'Escape' : 'Escape',
          click() {
            remeberSession()
            win.close()
          }
        },
        {
          label: "Quit",
          click() {
            remeberSession()
            app.quit()
          }
        }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)
  win.loadFile('index.html')

  win.webContents.on('did-finish-load', () => {
    openCurrentImage()
  })

  // Open the DevTools.
  // win.webContents.openDevTools()
}

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong')
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// receives an array of file and folder paths as strings
// recursively reads files from folders and subfolders
// retunrs a flat array of file paths from received array, folders and subfolders
const recursiveReadFiles = (fileAndFolderPaths) => {
  let files = []
  fileAndFolderPaths.forEach((path) => {
    if (fs.lstatSync(path).isDirectory()) {
      files = files.concat(recursiveReadFiles(fs.readdirSync(path).map((file) => path + '/' + file)))
    } else {
      files.push(path)
    }
  })

  return files
}

// receives an array of file paths as strings
// filters out non-image files
// returns a flat array of image file paths
const filterImageFiles = (filePaths) => {
  return filePaths.filter((filePath) => {
    return filePath.match(/\.(jpeg|jpg|gif|png|avif|jxl|webp|bmp)$/i)
  })
}

const SESSION_PATH = path.join(app.getPath("userData"), 'session.json')

const readSession = () => {
  try {
    const data = fs.readFileSync(SESSION_PATH, 'utf-8')
    return JSON.parse(data)
  } catch(error) {
    console.log('Error retrieving user data', error)
    // you may want to propagate the error, up to you
    return null
  }
}

const writeSession = (data) => {
  fs.writeFileSync(SESSION_PATH, JSON.stringify(data))
}
