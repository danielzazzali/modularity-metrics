import { getFiles } from "./input.js";
import fs from "fs";
import { parse } from "@babel/parser";
import { BABEL_PARSER_OPTIONS, ERROR_ON_FILE_MESSAGE, FILE_ENCODING } from "../constants/constants.js";


const files = getFiles();

function getAST(filePath) {
    const code = fs.readFileSync(filePath, FILE_ENCODING);
    return parse(code, BABEL_PARSER_OPTIONS);
}

function getAllASTs() {
    const astArray = [];

    files.forEach(file => {
        try {
            const ast = getAST(file.filePath);
            astArray.push({
                fileName: file.fileName,
                ast: ast
            });
        } catch (error) {
            console.error(`${ERROR_ON_FILE_MESSAGE} ${file.fileName}:`, error);
        }
    });

    return astArray;
}

export { getAllASTs };
