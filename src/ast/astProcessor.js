import fs from "fs/promises";
import {parse} from "@babel/parser";
import {BABEL_PARSER_OPTIONS, FILE_ENCODING, MESSAGES} from "../constants/constants.js";

async function getSourceCode(filePath) {
    try {
        return await fs.readFile(filePath, FILE_ENCODING)
    } catch (error) {
        console.error(`${MESSAGES.ERRORS.ERROR_READING_SOURCE_CODE} ${filePath}:`, error);
        throw error;
    }
}

async function getAST(filePath) {
    try {
        const code = await getSourceCode(filePath);
        return parse(code, BABEL_PARSER_OPTIONS);
    } catch (error) {
        console.error(`${MESSAGES.ERRORS.ERROR_ON_FILE} ${filePath}:`, error);
        console.error(`${MESSAGES.INFO.SKIPPING_FILE}`)
        return null;
    }
}

async function getASTs(files) {
    const astPromises = files.map(async (file) => {
        const ast = await getAST(file.filePath);
        if (ast === null) return;

        // Add metadata to AST
        Object.assign(ast.program.loc, { filename: file.fileName });
        Object.assign(ast.loc, { filename: file.fileName, filePath: file.filePath });

        return ast;
    });

    return await Promise.all(astPromises);
}

export { getASTs };