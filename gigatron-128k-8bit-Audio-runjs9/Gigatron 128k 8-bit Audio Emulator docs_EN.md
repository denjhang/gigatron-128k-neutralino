# Gigatron 128k 8-bit Audio Emulator Documentation

## Overview

This document provides a detailed explanation of the features, build process, and how to restore the drag-and-drop functionality for `.gt1` files in the `neu` packaged Gigatron 128k 8-bit Audio Emulator application.

## Program Features

### Core Functionality

The Gigatron 128k 8-bit Audio Emulator is a JavaScript-based Gigatron computer emulator with the following core features:

1. **Gigatron Hardware Emulation**:
   - Emulates Gigatron's CPU, RAM, and ROM.
   - Supports 128K RAM and IO expansion board.
   - Simulates SD card on SPI0 port.

2. **Video Output (VGA)**:
   - 640x480 resolution VGA display emulation.
   - Real-time rendering through HTML5 Canvas.

3. **Audio Output (8-bit Audio)**:
   - Supports 8-bit, 6-bit, and 4-bit audio output.
   - 44.1 kHz sampling rate.
   - Adjustable volume and mute functionality.

4. **Input Devices**:
   - Keyboard input support.
   - Virtual gamepad (including directional keys, A/B buttons, Start/Select buttons).
   - Touchscreen support (for mobile devices).

5. **Storage Devices**:
   - Supports loading `.gt1` and `.gt1x` program files.
   - Supports loading `.rom` files.
   - Supports loading and mounting `.vhd` and `.img` disk image files.

### User Interface

1. **LED Indicators**:
   - Four LED lights displaying system status.

2. **VGA Display**:
   - Emulates Gigatron's video output.

3. **Gamepad**:
   - Virtual gamepad controllable via mouse, touch, or keyboard.

4. **Volume Control**:
   - Volume slider and mute/unmute buttons.

5. **File Loader**:
   - File selection button for loading programs, ROMs, or disk images.
   - Disk mount/unmount buttons and status display.

6. **Keyboard Shortcuts**:
   - `[A]` button: `Delete/End` key
   - `[B]` button: `Insert/Home` key
   - `[Select]` button: `PageDown` key
   - `[Start]` button: `PageUp` key

## Drag-and-Drop Restoration

### Functionality Background

The original web-based Gigatron emulator allowed users to load games or programs by dragging `.gt1` files into the browser window. However, this functionality was missing in the `neu` packaged desktop application. This modification aims to restore this feature to enhance the user experience.

### Code Modifications

#### 1. Locating Key Files

- **Original Web Version Code**: `html/main.js`
- **Neu Application Code**: `resources/main.js`

**Note**: Modifying code in the `resources` folder affects the `neu` packaged application, while changes in the `html` folder do not.

#### 2. Restored Code Functionality

In `resources/main.js`, we added the following key functionalities:

##### a. Drag-and-Drop Event Listeners

```javascript
$(document)
    .on('dragenter', (event) => {
        event.preventDefault();
        event.stopPropagation();
        let dataTransfer = event.originalEvent.dataTransfer;
        dataTransfer.dropEffect = 'link';
    })
    .on('dragover', (event) => {
        event.preventDefault();
        event.stopPropagation();
    })
    .on('drop', (event) => {
        let dataTransfer = event.originalEvent.dataTransfer;
        if (dataTransfer) {
            let files = dataTransfer.files;
            if (files.length != 0) {
                event.preventDefault();
                event.stopPropagation();
                let file = files[0];
                let name = file.name.toLowerCase()
                if (name.endsWith('.rom')) {
                    loadRom(file);
                } else if (name.endsWith('.vhd')) {
                    spi.loadvhdfile(file);
                    setVhdLabel();
                } else {
                    loadGt1(file);
                }
            }
        }
    });
```

These event listeners are responsible for:
- `dragenter`: When a file is dragged into the window, set `dropEffect` to 'link'.
- `dragover`: Prevent default behavior to allow the file to be dropped.
- `drop`: Handle the dropped file, calling the appropriate loading function based on the file extension.

##### b. File Loading Functions

```javascript
function loadGt1(file) {
    gamepad.stop();
    spi.stop();
    return loader.load(file)
        .pipe(finalize(() => {
            gamepad.start();
            spi.start();
        }))
        .subscribe({
            error: (error) => showError($(`\
            <p>\
                Could not load GT1 from <code>${file.name}</code>\
            </p>\
            <hr>\
            <p class="alert alert-danger">\
                <span class="oi oi-warning"></span> ${error.message}\
            </p>`)),
        });
}

function loadRom(file) {
    gamepad.stop();
    spi.stop();
    return loader.loadRom(file)
        .pipe(finalize(() => {
            gamepad.start();
            spi.start();
        }))
        .subscribe({
            error: (error) => showError($(`\
            <p>\
                Could not load ROM from <code>${file.name}</code>\
            </p>\
            <hr>\
            <p class="alert alert-danger">\
                <span class="oi oi-warning"></span> ${error.message}\
            </p>`)),
        });
}
```

These functions are responsible for:
- Stopping the gamepad and SPI simulation.
- Using the `loader` to load the file.
- Resuming the simulation after loading is complete.
- Handling any errors that may occur during the loading process.

##### c. VHD Label Update Function

```javascript
function setVhdLabel() {
    if (spi.vhdmounted) {
        vhdLabel.text(spi.vhdname);
        mountButton.addClass('d-none');
        unmountButton.removeClass('d-none');
    } else {
        vhdLabel.text('no disk');
        mountButton.removeClass('d-none');
        unmountButton.addClass('d-none');
    }
}
```

This function is used to update the mount status display of the VHD disk image.

## Build and Run Process

### 1. Environment Preparation

Ensure Node.js and npm are installed. The project dependencies are already defined in `package.json`:

```json
{
  "dependencies": {
    "@neutralinojs/neu": "^11.6.0"
  }
}
```

### 2. Install Dependencies

Run the following command in the project root directory:

```bash
npm install
```

### 3. Build the Application

Use `npx` to execute the `neu` command to build the application:

```bash
npx neu build
```

This command will:
- Package the application resources.
- Generate the `resources.neu` file.
- Copy binary files to the `dist` directory.
- Patch the Windows executable.

After a successful build, the output will display:

```
neu: INFO Application package was generated at the dist directory!
```

### 4. Run the Application

Run the application in development mode:

```bash
npx neu run
```

This command will start the application with developer extensions and auto-reload enabled.

### 5. Test the Drag-and-Drop Functionality

1. After starting the application, find a `.gt1` file (e.g., `resources/music6.gt1`).
2. Drag the file into the application window.
3. If the functionality works correctly, the file will be loaded, and the emulator will start running the program.

## Troubleshooting

### 1. `neu: command not found`

If running the `neu` command directly results in a "command not found" error, please use `npx`:

```bash
npx neu build
npx neu run
```

### 2. Resource Loading Errors

If resource loading errors occur (such as for `favicon.ico`), ensure that all necessary files are present in the `resources` directory.

### 3. Drag-and-Drop Functionality Not Working

- Confirm that you have modified `resources/main.js` and not `html/main.js`.
- Rebuild and run the application.
- Check the browser console (if applicable) or log files for error messages.

### 4. Audio Issues

- Ensure that the browser or system allows audio playback.
- Check volume settings and mute status.
- In some browsers, user interaction may be required to start the audio context.

## Summary

Through the above steps, we have successfully restored the drag-and-drop loading functionality for `.gt1` files in the `neu` packaged Gigatron 128k 8-bit Audio Emulator application. This feature enhances the user experience, making it consistent with the original web version.

The core of the modification lies in adding drag-and-drop event listeners and corresponding file handling logic in `resources/main.js`. The build and run process is completed through `npx neu` commands, ensuring the correct packaging and deployment of the application.

The Gigatron 128k 8-bit Audio Emulator is a feature-rich emulator that not only provides complete Gigatron hardware emulation but also includes high-quality audio output and an intuitive user interface, offering users an excellent retrocomputing experience.