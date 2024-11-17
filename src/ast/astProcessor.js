import { getFiles } from "../files/fileReader.js";
import fs from "fs";
import { parse } from "@babel/parser";
import { BABEL_PARSER_OPTIONS, MESSAGES, FILE_ENCODING } from "../constants/constants.js";

/**
 * Reads the content of a file and parses it into an AST using Babel.
 * @param {string} filePath - The path to the file to be read and parsed.
 * @returns {Object|null} - The parsed AST or null if an error occurs.
 */
function getAST(filePath) {
    try {
        // Read the file content synchronously
        const code = fs.readFileSync(filePath, FILE_ENCODING);
        // Parse the code into an AST using Babel
        return parse(code, BABEL_PARSER_OPTIONS);
    } catch (error) {
        // Log error if reading or parsing fails
        console.error(`${MESSAGES.ERRORS.ERROR_ON_FILE} ${filePath}:`, error);
        return null; // Return null if the AST could not be generated
    }
}

/**
 * Gets the ASTs for all files by reading and parsing each file.
 * Returns an array of objects with file name and AST, or an error message.
 * @returns {Array} - An array of objects containing file names and their ASTs, or errors.
 */
function getASTs() {
    const files = getFiles();
    const astArray = [];

    files.forEach(file => {
        const ast = getAST(file.filePath); // Get AST for each file synchronously
        if (ast) {
            astArray.push({
                fileName: file.fileName,
                ast: ast
            });
        } else {
            astArray.push({
                fileName: file.fileName,
                error: `${MESSAGES.ERRORS.FAILED_TO_PARSE_FILE} ${file.fileName}` // Return error if AST is null
            });
        }
    });

    return astArray; // Return the array of results with ASTs or errors
}

export { getASTs };
