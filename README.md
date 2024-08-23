# Shiffle Image Viewer (Electron version with HDR support)

A simple-as-a-hammer image viewer made with Electron because only Chrome can reliably render HDR images with gain maps(jpeg, avif) on macOS, but it does not support JpegXL anymore, and switching from an SDR image to an HDR image always takes a few seconds to apply the proper colors, so maybe it is not that useful ¯\_(ツ)_/¯

## How to build

Have installed nodejs

Run `npn install` then `npm run make`

Fund binary in `/out` folder

## How to use

Choose folders and files, and the app will create a shuffled playlist.

Go to the next image with the Right arrow key (or Spacebar).

Go to the previous image with the Left arrow key.

Close the app with Esc. Open the app again to continue where you left off.

Press Delete to move the currently viewed file to Trash/Recycle Bin.
