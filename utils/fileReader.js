import path from 'path';
import fs from 'fs';
import { NODE_MODULES_DIRECTORY } from "../constants/constants.js";
import { getCustomPath } from "./config.js";
import { getIgnored, isSupported } from "./ignoreAndSupport.js";

function readDirectory(directory, ignoreFiles, arrayOfFiles) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const absolute = path.join(directory, file);

        if (absolute.includes(NODE_MODULES_DIRECTORY)) {
            continue;
        }

        if (ignoreFiles.includes(absolute)) {
            continue;
        }

        if (fs.statSync(absolute).isDirectory()) {
            readDirectory(absolute, ignoreFiles, arrayOfFiles);
        } else if (isSupported(absolute)) {
            arrayOfFiles.push({
                filePath: absolute,
                fileName: path.basename(absolute)
            });
        }
    }
}

function getFiles() {

    let arrayOfFiles = [];
    const path = getCustomPath() || process.cwd();

    const ignoreFiles = getIgnored(path);
    readDirectory(path, ignoreFiles, arrayOfFiles);

    return arrayOfFiles;
}

export { getFiles };