import path from "path";
import { REQUIRE_CALLEE_NAME } from "../constants/constants.js";

const state = {
    metricName: "Fan In Fan Out Per File",
    description: "This metric counts the number of files that a file imports (Fan Out) and the number of files that import a file (Fan In).",
    version: "0.0.1",
    results: {},
    currentFile: null
};

const visitors = {
    Program(pathNode, state) {
        state.currentFile = pathNode.node.loc.filename;
        state.results[state.currentFile] = { fanIn: [], fanOut: [] };
    },
    ImportDeclaration(pathNode, state) {
        const importedPath = pathNode.node.source.value;
        const normalizedPath = path.basename(importedPath);
        state.results[state.currentFile].fanOut.push(normalizedPath);
    },
    CallExpression(pathNode, state) {
        if (
            pathNode.node.callee.name === REQUIRE_CALLEE_NAME &&
            pathNode.node.arguments.length > 0
        ) {
            const requirePath = pathNode.node.arguments[0].value;
            const normalizedPath = path.basename(requirePath);
            state.results[state.currentFile].fanOut.push(normalizedPath);
        }
    }
};

function postProcessing(state) {
    const fanInMap = {};

    for (const [fileName, { fanOut }] of Object.entries(state.results)) {
        fanOut.forEach((importedFile) => {
            if (!fanInMap[importedFile]) {
                fanInMap[importedFile] = [];
            }
            fanInMap[importedFile].push(fileName);
        });
    }

    for (const [fileName, { fanIn, fanOut }] of Object.entries(state.results)) {
        state.results[fileName].fanIn = fanInMap[fileName] || [];
    }

    delete state.currentFile;
}

export { state, visitors, postProcessing };