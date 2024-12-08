import path from 'path';
import fs from 'fs/promises';
import { NODE_MODULES_DIRECTORY } from "../constants/constants.js";
import { config } from '../config/config.js';
import { getIgnored, isSupported } from "./ignoreAndSupport.js";

async function readDirectory(directory, ignoreFiles) {
    const files = await fs.readdir(directory, { withFileTypes: true });
    const arrayOfFiles = [];

    await Promise.all(files.map(async (file) => {
        const absolutePath = path.resolve(directory, file.name);

        if (absolutePath.includes(NODE_MODULES_DIRECTORY) || ignoreFiles.includes(absolutePath)) {
            return;
        }

        if (file.isDirectory()) {
            const subFiles = await readDirectory(absolutePath, ignoreFiles);
            arrayOfFiles.push(...subFiles);
        } else if (isSupported(absolutePath)) {
            arrayOfFiles.push({
                filePath: absolutePath,
                fileName: file.name
            });
        }
    }));

    return arrayOfFiles;
}

async function getFiles() {
    const basePath = config.path;
    const ignoreFiles = await getIgnored(basePath);
    return await readDirectory(basePath, ignoreFiles);
}

export { getFiles };