import {prettyPrint} from "./utils/output.js";
import {getAllASTs} from "./utils/ast.js";
import traverse from "@babel/traverse";

const ASTs = getAllASTs()

// Función para calcular el fan-out de un módulo
function calculateFanOut(ast) {
    const importedModules = new Set();

    traverse.default(ast, {
        ImportDeclaration({ node }) {
            importedModules.add(node.source.value);
        }
    });

    return importedModules.size;
}

const fanOutResults = ASTs.map(({ fileName, ast }) => {
    return {
        fileName,
        fanOut: calculateFanOut(ast)
    };
});

// Imprimir los imports por archivo
prettyPrint(fanOutResults);