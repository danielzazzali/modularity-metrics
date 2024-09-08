import {getFiles} from "./input.js";
import {parse} from '@babel/parser';
import fs from "fs";
import {BABEL_PARSER_OPTIONS} from "../constants/constants.js";

const files = getFiles();

function getAST(filePath) {
    const code = fs.readFileSync(filePath, 'utf-8');
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
            console.error(`Error on file ${file.fileName}:`, error);
        }
    });

    return astArray;
}

export { getAllASTs };
