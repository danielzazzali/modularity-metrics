import path from 'path';
import fs from 'fs';
import {
    FILE_ENCODING,
    IGNORE_FILES_FILENAME,
    JS_EXTENSION,
    LINE_BREAK,
    TS_EXTENSION
} from "../constants/constants.js";

function getIgnored(rootPath) {
    const ignorePath = path.join(rootPath, IGNORE_FILES_FILENAME);
    let ignoreFiles = [];
    if (fs.existsSync(ignorePath)) {
        ignoreFiles = fs.readFileSync(ignorePath, FILE_ENCODING).split(LINE_BREAK).map(line => path.join(rootPath, line));
    }
    return ignoreFiles;
}

function isSupported(absolute) {
    return path.extname(absolute) === JS_EXTENSION
        || path.extname(absolute) === TS_EXTENSION;
}

export { getIgnored, isSupported };