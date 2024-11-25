import path from 'path';
import fs from 'fs';
import {
    FILE_ENCODING,
    IGNORE_FILES_FILENAME,
    JS_EXTENSION,
    LINE_BREAK,
    MESSAGES,
    TS_EXTENSION
} from "../constants/constants.js";

/**
 * Reads the `.ignore` file in the root path to get a list of files and directories to ignore.
 * @param {string} rootPath - The root directory where the .ignore file is located.
 * @returns {Array} - An array of absolute paths of ignored files and directories.
 */
function getIgnored(rootPath) {
    const ignorePath = path.join(rootPath, IGNORE_FILES_FILENAME);
    let ignoreFiles = [];

    try {
        if (fs.existsSync(ignorePath)) {
            ignoreFiles = fs.readFileSync(ignorePath, FILE_ENCODING)
                .split(LINE_BREAK)
                .map(line => path.resolve(rootPath, line.trim()))  // Use path.resolve to get absolute paths
                .filter(Boolean);
        }
    } catch (error) {
        console.error(`${MESSAGES.ERRORS.ERROR_READING_IGNORE_FILE} ${ignorePath}:`, error);
    }

    return ignoreFiles;
}

/**
 * Checks if a given file path has a supported extension (JS or TS).
 * @param {string} absolute - The absolute file path to check.
 * @returns {boolean} - Returns true if the file has a JS or TS extension, false otherwise.
 */
function isSupported(absolute) {
    const ext = path.extname(absolute).toLowerCase();  // Normalize the extension to lowercase
    return [JS_EXTENSION, TS_EXTENSION].includes(ext);  // Check if the extension is supported
}

export { getIgnored, isSupported };
