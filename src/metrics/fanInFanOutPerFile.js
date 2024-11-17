import path from "path";
import { REQUIRE_CALLEE_NAME } from "../constants/constants.js";
import { traverseASTs } from "../ast/astTraversal.js";

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

function calculateFanInFanOutPerFile() {
    const visitors = getVisitors();
    const ASTResults = traverseASTs(visitors);

    const fanOut = {};
    const fanIn = {};

    ASTResults.forEach(({ fileName, results: importedFiles }) => {
        fanOut[fileName] = importedFiles;

        importedFiles.forEach((importedFile) => {
            if (!fanIn[importedFile]) {
                fanIn[importedFile] = [];
            }
            fanIn[importedFile].push(fileName);
        });
    });

    return ASTResults.map(({ fileName }) => {
        return {
            filename: fileName,
            fanOut: fanOut[fileName],
            fanIn: fanIn[fileName] || []
        };
    });
}

export { calculateFanInFanOutPerFile };