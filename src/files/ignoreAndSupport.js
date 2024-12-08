import path from 'path';
import fs from 'fs/promises';
import {
    FILE_ENCODING,
    IGNORE_FILES_FILENAME,
    JS_EXTENSION,
    LINE_BREAK,
    MESSAGES,
    TS_EXTENSION
} from "../constants/constants.js";

async function getIgnored(rootPath) {
    const ignorePath = path.join(rootPath, IGNORE_FILES_FILENAME);
    let ignoreFiles = [];

    try {
        if (await fs.access(ignorePath).then(() => true).catch(() => false)) {
            const data = await fs.readFile(ignorePath, FILE_ENCODING);
            ignoreFiles = data.split(LINE_BREAK)
                .map(line => path.resolve(rootPath, line.trim()))
                .filter(Boolean);
        }
    } catch (error) {
        console.error(`${MESSAGES.ERRORS.ERROR_READING_IGNORE_FILE} ${ignorePath}:`, error);
    }

    return ignoreFiles;
}

function isSupported(absolute) {
    const ext = path.extname(absolute).toLowerCase();
    return [JS_EXTENSION, TS_EXTENSION].includes(ext);
}

export { getIgnored, isSupported };