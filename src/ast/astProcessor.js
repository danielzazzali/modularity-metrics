import fs from "fs/promises";
import { parse } from "@babel/parser";
import { BABEL_PARSER_OPTIONS, FILE_ENCODING, MESSAGES } from "../constants/constants.js";

async function getAST(filePath) {
    try {
        const code = await fs.readFile(filePath, FILE_ENCODING);
        return parse(code, BABEL_PARSER_OPTIONS);
    } catch (error) {
        console.error(`${MESSAGES.ERRORS.ERROR_ON_FILE} ${filePath}:`, error);
        return null;
    }
}

async function getASTs(files) {
    return await Promise.all(files.map(async (file) => {
        const ast = await getAST(file.filePath);

        // Add the file name to the AST for easier reference
        ast.program.loc.filename = file.fileName;
        ast.loc.filename = file.fileName;

        // Add the file path to the AST for easier reference
        ast.loc.filePath = file.filePath;

        return ast
    }));
}

export { getASTs };