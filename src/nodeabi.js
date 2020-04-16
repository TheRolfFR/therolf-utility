const nodeAbi = require('node-abi')

//make sure to change version info with your version
console.log('node:' + nodeAbi.getAbi('12.2.0', 'node'))
console.log('electron:' + nodeAbi.getAbi('8.1.1', 'electron'))

/**
 * PROCESS TO REBUILD NATIVE MODULES (IOHOOK, ROBOTJS) FOR ELECTRON
 *
 * 1. Choose an official supported version of Electron
 * 2. Delete node_module folder and package-lock.json file
 * 3. Install node modules (npm i)
 * 4. Rebuild node modules (npm rebuild)
 * 5. Rebuild electron
 */
