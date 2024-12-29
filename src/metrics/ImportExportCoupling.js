import path from 'path';
import fs from 'fs';

const state = {
    metricName: "Import/Export Coupling",
    description: "This metric counts the number of files that a file imports and the number of files that import a file.",
    version: "1.1",
    result: {},
    currentFile: null,
    currentDir: null,
    unresolved: {},
};

const visitors = {
    Program(pathNode, state) {
        const filePath = pathNode.parent.loc.filePath;
        const dirName = path.dirname(filePath);

        state.currentFile = filePath
        state.currentDir = dirName;

        if (!state.result[filePath]) {
            state.result[filePath] = {
                imports: [],
                exports: [],
            };
        }
    },
    ImportDeclaration(pathNode, state) {
        const importPath = pathNode.node.source.value;
        const currentDir = state.currentDir;

        let absolutePath = null;

        if (importPath.startsWith('.')) {
            absolutePath = path.resolve(currentDir, importPath);
            if (!fs.existsSync(absolutePath) && !absolutePath.endsWith('.js')) {
                absolutePath += '.js';
            }
        } else {
            try {
                absolutePath = require.resolve(importPath, { paths: [currentDir] });
            } catch (err) {
                if (!state.unresolved[state.currentFile]) {
                    state.unresolved[state.currentFile] = [];
                }
                state.unresolved[state.currentFile].push(importPath);
                return;
            }
        }

        if (absolutePath) {
            state.result[state.currentFile].imports.push(absolutePath);
        }
    },
    CallExpression(pathNode, state) {
        if (
            pathNode.node.callee.name === 'require' &&
            pathNode.node.arguments.length > 0
        ) {
            const requirePath = pathNode.node.arguments[0].value;
            const currentDir = state.currentDir;

            let absolutePath = null;

            if (requirePath.startsWith('.')) {

                absolutePath = path.resolve(currentDir, requirePath);
                if (!fs.existsSync(absolutePath) && !absolutePath.endsWith('.js')) {
                    absolutePath += '.js';
                }
            } else {

                try {
                    absolutePath = require.resolve(requirePath, { paths: [currentDir] });
                } catch (err) {
                    if (!state.unresolved[state.currentFile]) {
                        state.unresolved[state.currentFile] = [];
                    }
                    state.unresolved[state.currentFile].push(requirePath);
                    return;
                }
            }

            if (absolutePath) {
                state.result[state.currentFile].imports.push(absolutePath);
            }
        }
    }
};

function postProcessing(state) {
    for (const [file, { imports }] of Object.entries(state.result)) {
        for (const importedFile of imports) {
            if (!state.result[importedFile]) {
                state.result[importedFile] = {
                    imports: [],
                    exports: [],
                };
            }

            state.result[importedFile].exports.push(file);
        }
    }

    delete state.currentFile;
    delete state.currentDir;
}

export { state, visitors, postProcessing };
