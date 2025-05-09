import fs from "fs/promises";
import {parse} from "@babel/parser";
import {BABEL_PARSER_OPTIONS, CLEANUP_KEYS, FILE_ENCODING, MESSAGES} from "../constants/constants.js";
import { logger } from "../logger/logger.js";


/**
 * Recursively removes location-related properties from an AST node or array of nodes.
 *
 * @param {object|array|null|undefined} node
 *   The AST node (object) or array of nodes to process.
 */
export function removeASTLocation(node) {
    if (node == null) {
        // Nothing to do for null or undefined
        return;
    }

    if (Array.isArray(node)) {
        // Process each element in the array
        for (const child of node) {
            removeASTLocation(child);
        }
        return;
    }

    if (typeof node !== 'object') {
        // Primitives (string, number, etc.) no properties to remove
        return;
    }

    // Remove each location key if present
    for (const key of CLEANUP_KEYS) {
        if (key in node) {
            delete node[key];
        }
    }

    // Recurse into any child objects or arrays
    for (const value of Object.values(node)) {
        if (value && (Array.isArray(value) || typeof value === 'object')) {
            removeASTLocation(value);
        }
    }
}

async function getSourceCode(filePath) {
    try {
        return await fs.readFile(filePath, FILE_ENCODING)
    } catch (error) {
        throw new Error(`${MESSAGES.ERRORS.ERROR_READING_SOURCE_CODE} ${filePath}: ${error.message}`);
    }
}

async function getAST(filePath) {
    try {
        const code = await getSourceCode(filePath);
        return parse(code, BABEL_PARSER_OPTIONS);
    } catch (error) {
        logger.logParseError(error.message);
        return null;
    }
}

async function constructASTs(files) {
    const astPromises = files.map(async (file) => {
        const ast = await getAST(file.filePath);
        if (ast === null) return;

        removeASTLocation(ast);

        // Add metadata to AST
        ast.program.filePath = file.filePath;

        return ast;
    });

    return await Promise.all(astPromises);
}

export { constructASTs };