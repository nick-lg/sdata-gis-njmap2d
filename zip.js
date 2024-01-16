const fs = require('fs');
const path = require('path');
const Zip = require('node-zip');
const meta = require('./package.json');


function zipFolder(folderPath, zipFilePath) {
    const zip = new Zip();

    function addFolderToZip(folderPath, zipFolderObj) {
        const files = fs.readdirSync(folderPath);
        files.forEach((file) => {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
                const data = fs.readFileSync(filePath);
                const zipObj = zipFolderObj || zip;
                zipObj.file(file, data);

            } else if (stats.isDirectory()) {
                const zipFolderPath = filePath.slice(filePath.indexOf("\\") + 1);
                const _zipFolderObj = zip.folder(zipFolderPath);
                addFolderToZip(filePath, _zipFolderObj);
            }
        });
    }

    addFolderToZip(folderPath);
    const data = zip.generate({ base64: false, compression: 'DEFLATE' });
    fs.writeFileSync(zipFilePath, data, 'binary');
    console.log(`------compressed successful:${meta.name}@${meta.version}.zip------`)
}

const folderPath = './build';
const zipFilePath = `./build-zip/${meta.name}@${meta.version}.zip`;
zipFolder(folderPath, zipFilePath);