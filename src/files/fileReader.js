import path from 'path';
import fs from 'fs';
import { NODE_MODULES_DIRECTORY } from "../constants/constants.js";
import { config } from '../config/config.js';
import { getIgnored, isSupported } from "./ignoreAndSupport.js";

/**
 * Reads a directory recursively, ignoring specified files and folders, and collecting supported files.
 * @param {string} directory - The directory to read.
 * @param {Array} ignoreFiles - Array of files/folders to ignore.
 * @param {Array} arrayOfFiles - The array to accumulate supported files.
 */
function readDirectory(directory, ignoreFiles, arrayOfFiles) {
    const files = fs.readdirSync(directory, { withFileTypes: true }); // Use withFileTypes for better performance

    for (const file of files) {
        const absolutePath = path.resolve(directory, file.name); // Resolve to absolute path for comparison

        // Skip if it's in node_modules or ignored
        if (absolutePath.includes(NODE_MODULES_DIRECTORY) || ignoreFiles.includes(absolutePath)) {
            continue;
        }

        if (file.isDirectory()) {
            // Recurse into subdirectory
            readDirectory(absolutePath, ignoreFiles, arrayOfFiles);
        } else if (isSupported(absolutePath)) {
            // Add supported file to array
            arrayOfFiles.push({
                filePath: absolutePath,
                fileName: file.name
            });
        }
    }
}

/**
 * Retrieves all files in the specified directory (or current working directory by default), excluding ignored ones.
 * @returns {Array} - Array of file objects containing filePath and fileName.
 */
function getFiles() {
    const arrayOfFiles = [];
    const basePath = config.customPath || process.cwd(); // Use the custom path or current working directory

    const ignoreFiles = getIgnored(basePath); // Get files to ignore
    readDirectory(basePath, ignoreFiles, arrayOfFiles); // Read the directory recursively

    return arrayOfFiles;
}

export { getFiles };
