import path from 'path';
import fs from 'fs';

const state = {
    metricName: "Import/Export Coupling",
    description: "This metric measures how many files a file depends on (imports) and how many files depend on it (are importing it).",
    version: "1.2",
    result: {},
    filePath: null,
    currentDir: null,
    unresolved: {},
};

const visitors = [{
    Program(pathNode, state) {
        state.filePath = pathNode.parent.loc.filePath;
        state.currentDir = path.dirname(state.filePath);

        if (!state.result[state.filePath]) {
            state.result[state.filePath] = {
                imports: [],
                exports: [],
            };
        }
    },
    ImportDeclaration(pathNode, state) {
        const importedPath = pathNode.node.source.value;
        const currentDir = state.currentDir;

        let importedAbsolutePath = path.resolve(currentDir, importedPath);

        if (!importedAbsolutePath.endsWith('.ts') && !importedAbsolutePath.endsWith('.js')) {
            const tsPath = `${importedAbsolutePath}.ts`;
            const jsPath = `${importedAbsolutePath}.js`;

            if (fs.existsSync(tsPath)) {
                importedAbsolutePath = tsPath;
            } else if (fs.existsSync(jsPath)) {
                importedAbsolutePath = jsPath;
            }
        }

        if (fs.existsSync(importedAbsolutePath)) {
            state.result[state.filePath].imports.push(importedAbsolutePath);

            if (!state.result[importedAbsolutePath]) {
                state.result[importedAbsolutePath] = {
                    imports: [],
                    exports: [],
                };
            }

            state.result[importedAbsolutePath].exports.push(state.filePath);
        } else {
            const relativePath = path.relative(state.currentDir, importedAbsolutePath);
            if (!state.unresolved[state.filePath]) {
                state.unresolved[state.filePath] = [];
            }
            state.unresolved[state.filePath].push(relativePath);
        }
    },
    CallExpression(pathNode, state) {
        if (
            pathNode.node.callee.name === 'require' &&
            pathNode.node.arguments.length > 0
        ) {
            const importedPath = pathNode.node.arguments[0].value;
            const currentDir = state.currentDir;

            let importedAbsolutePath = path.resolve(currentDir, importedPath);

            if (!importedAbsolutePath.endsWith('.ts') && !importedAbsolutePath.endsWith('.js')) {
                const tsPath = `${importedAbsolutePath}.ts`;
                const jsPath = `${importedAbsolutePath}.js`;

                if (fs.existsSync(tsPath)) {
                    importedAbsolutePath = tsPath;
                } else if (fs.existsSync(jsPath)) {
                    importedAbsolutePath = jsPath;
                }
            }

            if (fs.existsSync(importedAbsolutePath)) {
                state.result[state.filePath].imports.push(importedAbsolutePath);

                if (!state.result[importedAbsolutePath]) {
                    state.result[importedAbsolutePath] = {
                        imports: [],
                        exports: [],
                    };
                }

                state.result[importedAbsolutePath].exports.push(state.filePath);
            } else {
                const relativePath = path.relative(state.currentDir, importedAbsolutePath);
                if (!state.unresolved[state.filePath]) {
                    state.unresolved[state.filePath] = [];
                }
                state.unresolved[state.filePath].push(relativePath);
            }
        }
    }
}];

function postProcessing(state) {
    delete state.currentDir;
    delete state.filePath;
}

export { state, visitors, postProcessing };
