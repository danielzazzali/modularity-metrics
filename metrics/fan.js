import traverse from "@babel/traverse";
import path from "path";
import { REQUIRE_CALLEE_NAME } from "../constants/constants.js";

function initializeDependencies(ASTs) {
    const fileDependencies = {};
    const reverseDependencies = {};

    ASTs.forEach(({ fileName }) => {
        fileDependencies[fileName] = [];
        reverseDependencies[fileName] = [];
    });

    return { fileDependencies, reverseDependencies };
}

function extractImportedFiles(ast) {
    const importedFiles = [];

    traverse.default(ast, {
        ImportDeclaration(pathNode) {
            const importedPath = pathNode.node.source.value;
            const normalizedPath = path.basename(importedPath);
            importedFiles.push(normalizedPath);
        },
        CallExpression(pathNode) {
            if (
                pathNode.node.callee.name === REQUIRE_CALLEE_NAME &&
                pathNode.node.arguments.length > 0
            ) {
                const requirePath = pathNode.node.arguments[0].value;
                const normalizedPath = path.basename(requirePath);
                importedFiles.push(normalizedPath);
            }
        }
    });

    return importedFiles;
}

function calculateFanOutAndFanIn(ASTs, fileDependencies, reverseDependencies) {
    ASTs.forEach(({ fileName, ast }) => {
        const importedFiles = extractImportedFiles(ast);

        fileDependencies[fileName] = importedFiles;

        importedFiles.forEach((importedFile) => {
            if (!reverseDependencies[importedFile]) {
                reverseDependencies[importedFile] = [];
            }
            reverseDependencies[importedFile].push(fileName);
        });
    });
}

function createFanMetricsResult(ASTs, fileDependencies, reverseDependencies) {
    return ASTs.map(({ fileName }) => {
        return {
            filename: fileName,
            fanOut: fileDependencies[fileName] || [],
            fanIn: reverseDependencies[fileName] || []
        };
    });
}

function calculateFanMetrics(ASTs) {
    const { fileDependencies, reverseDependencies } = initializeDependencies(ASTs);
    calculateFanOutAndFanIn(ASTs, fileDependencies, reverseDependencies);
    return createFanMetricsResult(ASTs, fileDependencies, reverseDependencies);
}

export { calculateFanMetrics };