/**
 * Neutralino.js - Lightweight cross-platform native application framework
 * Copyright (C) 2020-2023 Neutralino Software Pty. Ltd.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

(function() {
    'use strict';

    const NL_PORT = __NL_PORT__;
    const NL_TOKEN = __NL_TOKEN__;
    const NL_CWD = __NL_CWD__;
    const NL_PID = __NL_PID__;
    const NL_VERSION = __NL_VERSION__;
    const NL_MODE = __NL_MODE__;
    const NL_ARGS = __NL_ARGS__;

    let messageId = 0;
    const callbacks = {};
    const nativeCallbacks = {};

    /**
     * Send a message to the native side
     * @param {string} method - The native method to call
     * @param {object} data - The data to send
     * @returns {Promise} - Promise that resolves with the response
     */
    function sendMessage(method, data = {}) {
        return new Promise((resolve, reject) => {
            const id = ++messageId;
            callbacks[id] = { resolve, reject };

            const message = {
                id,
                method,
                data,
                accessToken: NL_TOKEN
            };

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `http://localhost:${NL_PORT}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.timeout = 30000;

            xhr.onload = function() {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.id === id) {
                        delete callbacks[id];
                        if (response.error) {
                            reject(new Error(response.error));
                        } else {
                            resolve(response.data);
                        }
                    }
                } catch (e) {
                    reject(e);
                }
            };

            xhr.onerror = function() {
                delete callbacks[id];
                reject(new Error('Network error'));
            };

            xhr.ontimeout = function() {
                delete callbacks[id];
                reject(new Error('Request timeout'));
            };

            xhr.send(JSON.stringify(message));
        });
    }

    /**
     * Check if the app is running in native mode
     * @returns {boolean}
     */
    function isNativeMode() {
        return NL_MODE === 'window';
    }

    /**
     * Get the command line arguments
     * @returns {array}
     */
    function getArguments() {
        return NL_ARGS;
    }

    /**
     * Get the current working directory
     * @returns {string}
     */
    function getCwd() {
        return NL_CWD;
    }

    /**
     * Get the process ID
     * @returns {number}
     */
    function getPid() {
        return NL_PID;
    }

    /**
     * Get the Neutralino version
     * @returns {string}
     */
    function getVersion() {
        return NL_VERSION;
    }

    /**
     * Execute a command
     * @param {string} command - The command to execute
     * @param {object} options - Options for the command
     * @returns {Promise}
     */
    function exec(command, options = {}) {
        return sendMessage('os.exec.command', { command, ...options });
    }

    /**
     * Show a message box
     * @param {string} title - The title of the message box
     * @param {string} content - The content of the message box
     * @param {string} type - The type of the message box (info, warning, error)
     * @returns {Promise}
     */
    function showMessageBox(title, content, type = 'info') {
        return sendMessage('os.showMessageBox', { title, content, type });
    }

    /**
     * Show a folder dialog
     * @param {string} title - The title of the dialog
     * @returns {Promise}
     */
    function showFolderDialog(title = 'Select folder') {
        return sendMessage('os.showFolderDialog', { title });
    }

    /**
     * Show an open file dialog
     * @param {string} title - The title of the dialog
     * @param {array} filters - File filters
     * @param {boolean} multiSelection - Allow multiple file selection
     * @returns {Promise}
     */
    function showOpenDialog(title = 'Open file', filters = [], multiSelection = false) {
        return sendMessage('os.showOpenDialog', { title, filters, multiSelection });
    }

    /**
     * Show a save file dialog
     * @param {string} title - The title of the dialog
     * @param {array} filters - File filters
     * @param {string} defaultPath - Default file path
     * @returns {Promise}
     */
    function showSaveDialog(title = 'Save file', filters = [], defaultPath = '') {
        return sendMessage('os.showSaveDialog', { title, filters, defaultPath });
    }

    /**
     * Set a tray menu
     * @param {array} menu - The menu items
     * @returns {Promise}
     */
    function setTray(menu) {
        return sendMessage('os.setTray', { menu });
    }

    /**
     * Read a file
     * @param {string} path - The file path
     * @returns {Promise}
     */
    function readFile(path) {
        return sendMessage('filesystem.readFile', { path });
    }

    /**
     * Write a file
     * @param {string} path - The file path
     * @param {string} content - The file content
     * @returns {Promise}
     */
    function writeFile(path, content) {
        return sendMessage('filesystem.writeFile', { path, content });
    }

    /**
     * Check if a file or directory exists
     * @param {string} path - The path to check
     * @returns {Promise}
     */
    function exists(path) {
        return sendMessage('filesystem.exists', { path });
    }

    /**
     * Create a directory
     * @param {string} path - The directory path
     * @returns {Promise}
     */
    function createDirectory(path) {
        return sendMessage('filesystem.createDirectory', { path });
    }

    /**
     * Remove a file or directory
     * @param {string} path - The path to remove
     * @returns {Promise}
     */
    function remove(path) {
        return sendMessage('filesystem.remove', { path });
    }

    /**
     * Read a directory
     * @param {string} path - The directory path
     * @returns {Promise}
     */
    function readDirectory(path) {
        return sendMessage('filesystem.readDirectory', { path });
    }

    /**
     * Copy a file or directory
     * @param {string} source - The source path
     * @param {string} destination - The destination path
     * @returns {Promise}
     */
    function copy(source, destination) {
        return sendMessage('filesystem.copyFile', { source, destination });
    }

    /**
     * Move a file or directory
     * @param {string} source - The source path
     * @param {string} destination - The destination path
     * @returns {Promise}
     */
    function move(source, destination) {
        return sendMessage('filesystem.moveFile', { source, destination });
    }

    /**
     * Get environment variables
     * @returns {Promise}
     */
    function getEnvs() {
        return sendMessage('os.getEnvs');
    }

    /**
     * Get an environment variable
     * @param {string} key - The environment variable key
     * @returns {Promise}
     */
    function getEnv(key) {
        return sendMessage('os.getEnv', { key });
    }

    /**
     * Set an environment variable
     * @param {string} key - The environment variable key
     * @param {string} value - The environment variable value
     * @returns {Promise}
     */
    function setEnv(key, value) {
        return sendMessage('os.setEnv', { key, value });
    }

    /**
     * Get the app data directory
     * @returns {Promise}
     */
    function getPath() {
        return sendMessage('os.getPath');
    }

    /**
     * Open a URL in the default browser
     * @param {string} url - The URL to open
     * @returns {Promise}
     */
    function open(url) {
        return sendMessage('os.open', { url });
    }

    /**
     * Get the computer memory information
     * @returns {Promise}
     */
    function getMemoryInfo() {
        return sendMessage('computer.getMemoryInfo');
    }

    /**
     * Get the computer network interfaces
     * @returns {Promise}
     */
    function getNetworkInterfaces() {
        return sendMessage('computer.getNetworkInterfaces');
    }

    /**
     * Get the computer battery information
     * @returns {Promise}
     */
    function getBatteryInfo() {
        return sendMessage('computer.getBatteryInfo');
    }

    /**
     * Get the computer display information
     * @returns {Promise}
     */
    function getDisplays() {
        return sendMessage('computer.getDisplays');
    }

    /**
     * Get the computer mouse position
     * @returns {Promise}
     */
    function getMousePosition() {
        return sendMessage('computer.getMousePosition');
    }

    /**
     * Set the window title
     * @param {string} title - The window title
     * @returns {Promise}
     */
    function setTitle(title) {
        return sendMessage('window.setTitle', { title });
    }

    /**
     * Get the window title
     * @returns {Promise}
     */
    function getTitle() {
        return sendMessage('window.getTitle');
    }

    /**
     * Set the window position
     * @param {number} x - The x position
     * @param {number} y - The y position
     * @returns {Promise}
     */
    function setPosition(x, y) {
        return sendMessage('window.setPosition', { x, y });
    }

    /**
     * Get the window position
     * @returns {Promise}
     */
    function getPosition() {
        return sendMessage('window.getPosition');
    }

    /**
     * Set the window size
     * @param {number} width - The window width
     * @param {number} height - The window height
     * @returns {Promise}
     */
    function setSize(width, height) {
        return sendMessage('window.setSize', { width, height });
    }

    /**
     * Get the window size
     * @returns {Promise}
     */
    function getSize() {
        return sendMessage('window.getSize');
    }

    /**
     * Maximize the window
     * @returns {Promise}
     */
    function maximize() {
        return sendMessage('window.maximize');
    }

    /**
     * Unmaximize the window
     * @returns {Promise}
     */
    function unmaximize() {
        return sendMessage('window.unmaximize');
    }

    /**
     * Minimize the window
     * @returns {Promise}
     */
    function minimize() {
        return sendMessage('window.minimize');
    }

    /**
     * Restore the window
     * @returns {Promise}
     */
    function restore() {
        return sendMessage('window.restore');
    }

    /**
     * Set the window to fullscreen
     * @returns {Promise}
     */
    function setFullscreen() {
        return sendMessage('window.setFullscreen');
    }

    /**
     * Exit fullscreen mode
     * @returns {Promise}
     */
    function exitFullscreen() {
        return sendMessage('window.exitFullscreen');
    }

    /**
     * Show the window
     * @returns {Promise}
     */
    function show() {
        return sendMessage('window.show');
    }

    /**
     * Hide the window
     * @returns {Promise}
     */
    function hide() {
        return sendMessage('window.hide');
    }

    /**
     * Focus the window
     * @returns {Promise}
     */
    function focus() {
        return sendMessage('window.focus');
    }

    /**
     * Set the window always on top
     * @param {boolean} alwaysOnTop - Whether the window should always be on top
     * @returns {Promise}
     */
    function setAlwaysOnTop(alwaysOnTop) {
        return sendMessage('window.setAlwaysOnTop', { alwaysOnTop });
    }

    /**
     * Set the window borderless
     * @param {boolean} borderless - Whether the window should be borderless
     * @returns {Promise}
     */
    function setBorderless(borderless) {
        return sendMessage('window.setBorderless', { borderless });
    }

    /**
     * Set the window resizable
     * @param {boolean} resizable - Whether the window should be resizable
     * @returns {Promise}
     */
    function setResizable(resizable) {
        return sendMessage('window.setResizable', { resizable });
    }

    /**
     * Set the window maximum size
     * @param {number} width - The maximum width
     * @param {number} height - The maximum height
     * @returns {Promise}
     */
    function setMaxSize(width, height) {
        return sendMessage('window.setMaxSize', { width, height });
    }

    /**
     * Set the window minimum size
     * @param {number} width - The minimum width
     * @param {number} height - The minimum height
     * @returns {Promise}
     */
    function setMinSize(width, height) {
        return sendMessage('window.setMinSize', { width, height });
    }

    /**
     * Exit the application
     * @returns {Promise}
     */
    function exit() {
        return sendMessage('app.exit');
    }

    /**
     * Restart the application
     * @returns {Promise}
     */
    function restart() {
        return sendMessage('app.restart');
    }

    /**
     * Get the config
     * @returns {Promise}
     */
    function getConfig() {
        return sendMessage('app.getConfig');
    }

    /**
     * Set data
     * @param {string} key - The data key
     * @param {any} value - The data value
     * @returns {Promise}
     */
    function setData(key, value) {
        return sendMessage('storage.setData', { key, value });
    }

    /**
     * Get data
     * @param {string} key - The data key
     * @returns {Promise}
     */
    function getData(key) {
        return sendMessage('storage.getData', { key });
    }

    /**
     * Remove data
     * @param {string} key - The data key
     * @returns {Promise}
     */
    function removeData(key) {
        return sendMessage('storage.removeData', { key });
    }

    /**
     * Clear all data
     * @returns {Promise}
     */
    function clearData() {
        return sendMessage('storage.clearData');
    }

    /**
     * Add an event listener
     * @param {string} event - The event name
     * @param {function} callback - The callback function
     */
    function on(event, callback) {
        if (!nativeCallbacks[event]) {
            nativeCallbacks[event] = [];
        }
        nativeCallbacks[event].push(callback);
    }

    /**
     * Remove an event listener
     * @param {string} event - The event name
     * @param {function} callback - The callback function
     */
    function off(event, callback) {
        if (nativeCallbacks[event]) {
            const index = nativeCallbacks[event].indexOf(callback);
            if (index > -1) {
                nativeCallbacks[event].splice(index, 1);
            }
        }
    }

    /**
     * Trigger an event
     * @param {string} event - The event name
     * @param {any} data - The event data
     */
    function trigger(event, data) {
        if (nativeCallbacks[event]) {
            nativeCallbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error('Error in event callback:', e);
                }
            });
        }
    }

    /**
     * Initialize the Neutralino client
     */
    function init() {
        if (isNativeMode()) {
            // Create a WebSocket connection for event handling
            const ws = new WebSocket(`ws://localhost:${NL_PORT}?accessToken=${NL_TOKEN}`);
            
            ws.onopen = function() {
                console.log('Connected to Neutralino server');
            };
            
            ws.onmessage = function(event) {
                try {
                    const message = JSON.parse(event.data);
                    if (message.event) {
                        trigger(message.event, message.data);
                    }
                } catch (e) {
                    console.error('Error parsing WebSocket message:', e);
                }
            };
            
            ws.onerror = function(error) {
                console.error('WebSocket error:', error);
            };
            
            ws.onclose = function() {
                console.log('Disconnected from Neutralino server');
            };
        }
    }

    // Expose the API
    window.Neutralino = {
        init,
        isNativeMode,
        getArguments,
        getCwd,
        getPid,
        getVersion,
        exec,
        showMessageBox,
        showFolderDialog,
        showOpenDialog,
        showSaveDialog,
        setTray,
        readFile,
        writeFile,
        exists,
        createDirectory,
        remove,
        readDirectory,
        copy,
        move,
        getEnvs,
        getEnv,
        setEnv,
        getPath,
        open,
        getMemoryInfo,
        getNetworkInterfaces,
        getBatteryInfo,
        getDisplays,
        getMousePosition,
        setTitle,
        getTitle,
        setPosition,
        getPosition,
        setSize,
        getSize,
        maximize,
        unmaximize,
        minimize,
        restore,
        setFullscreen,
        exitFullscreen,
        show,
        hide,
        focus,
        setAlwaysOnTop,
        setBorderless,
        setResizable,
        setMaxSize,
        setMinSize,
        exit,
        restart,
        getConfig,
        setData,
        getData,
        removeData,
        clearData,
        on,
        off
    };

    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();