window.electronAPI.onImageOpen((prevImagePath, imagePath, nextImagePath) => {
  document.querySelector('.prev-frame').style = `background-image: url('${prevImagePath}')`
  document.querySelector('.frame').style = `background-image: url('${imagePath}')`
  document.querySelector('.next-frame').style = `background-image: url('${nextImagePath}')`

  setTitle()
})

window.electronAPI.onNextImageOpen((nextImagePath) => {
  let prevFrame = document.querySelector('.prev-frame')
  let frame = document.querySelector('.frame')
  let nextFrame = document.querySelector('.next-frame')

  frame.classList.add('prev-frame')
  frame.classList.remove('frame')
  nextFrame.classList.add('frame')
  nextFrame.classList.remove('next-frame')

  prevFrame.classList.add('next-frame')
  prevFrame.classList.remove('prev-frame')
  prevFrame.style = `background-image: url('${nextImagePath}')`

  setTitle()
})

window.electronAPI.onPrevImageOpen((prevImagePath) => {
  let prevFrame = document.querySelector('.prev-frame')
  let frame = document.querySelector('.frame')
  let nextFrame = document.querySelector('.next-frame')

  frame.classList.add('next-frame')
  frame.classList.remove('frame')
  prevFrame.classList.add('frame')
  prevFrame.classList.remove('prev-frame')

  nextFrame.classList.add('prev-frame')
  nextFrame.classList.remove('next-frame')
  nextFrame.style = `background-image: url('${prevImagePath}')`

  setTitle()
})

window.electronAPI.onImageDeleted((imagePath) => {
  // show simple disappearing floating alert
  let alert = document.createElement('div')
  alert.classList.add('alert')
  alert.innerHTML = `Trashed: ${imagePath}`
  document.body.appendChild(alert)

  setTimeout(() => {
    alert.remove()
  }, 3000)
})

const setTitle = () => {
  let url = document.querySelector('.frame').style['background-image'].replace(/^url\(['"]?/,'').replace(/['"]?\)$/,'')
  let img = new Image()

  img.onload = () => {
    document.title = `${url} (${img.naturalWidth} x ${img.naturalHeight})`
  }

  img.src = url
}
