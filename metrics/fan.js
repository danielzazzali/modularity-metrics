import path from "path";
import { REQUIRE_CALLEE_NAME } from "../constants/constants.js";
import { traverseASTsFan } from "../utils/astTraversal.js";

function getVisitors() {
    return {
        ImportDeclaration(pathNode, state) {
            const importedPath = pathNode.node.source.value;
            const normalizedPath = path.basename(importedPath);
            state.results.push(normalizedPath);
        },
        CallExpression(pathNode, state) {
            if (
                pathNode.node.callee.name === REQUIRE_CALLEE_NAME &&
                pathNode.node.arguments.length > 0
            ) {
                const requirePath = pathNode.node.arguments[0].value;
                const normalizedPath = path.basename(requirePath);
                state.results.push(normalizedPath);
            }
        }
    };
}

function calculateFanMetrics() {
    const visitors = getVisitors();
    const ASTResults = traverseASTsFan(visitors);

    const fileDependencies = {};
    const reverseDependencies = {};

    ASTResults.forEach(({ fileName, results: importedFiles }) => {
        fileDependencies[fileName] = importedFiles;

        importedFiles.forEach((importedFile) => {
            if (!reverseDependencies[importedFile]) {
                reverseDependencies[importedFile] = [];
            }
            reverseDependencies[importedFile].push(fileName);
        });
    });

    return ASTResults.map(({ fileName }) => {
        return {
            filename: fileName,
            fanOut: fileDependencies[fileName] || [],
            fanIn: reverseDependencies[fileName] || []
        };
    });
}

export { calculateFanMetrics };