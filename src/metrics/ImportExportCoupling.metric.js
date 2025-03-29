import path from 'path';
import fs from 'fs';

const state = {
    metricName: "Import/Export Coupling",
    description: "Analyzes module dependencies across ES, CommonJS, and TypeScript",
    result: {
        files: {},
        unresolved: {}
    },
    currentFile: null,
    currentDir: null
};

const visitors = [
    {
        Program(pathNode, state) {
            state.currentFile = pathNode.parent.loc?.filePath;
            state.currentDir = path.dirname(state.currentFile);

            if (!state.result.files[state.currentFile]) {
                state.result.files[state.currentFile] = {
                    imports: [],
                    exports: []
                };
            }
        },

        ImportDeclaration(pathNode, state) {
            processDependency(pathNode.node.source.value, state);
        },

        CallExpression(pathNode, state) {
            if (pathNode.node.callee.name === 'require' &&
                pathNode.node.arguments.length > 0 &&
                pathNode.node.arguments[0].type === 'StringLiteral') {
                processDependency(pathNode.node.arguments[0].value, state);
            }
        },

        TSImportEqualsDeclaration(pathNode, state) {
            if (pathNode.node.moduleReference.type === 'TSExternalModuleReference') {
                const importPath = pathNode.node.moduleReference.expression.value;
                processDependency(importPath, state);
            }
        }
    }
];

function processDependency(importPath, state) {
    try {
        const resolved = resolveImportPath(importPath, state.currentDir);

        resolved.exists ?
            registerDependency(state.currentFile, resolved.absolute, state) :
            trackUnresolved(state.currentFile, resolved.relative, state);
    } catch (error) {
        console.warn(`Dependency processing error: ${importPath}`, error);
    }
}

function resolveImportPath(importPath, baseDir) {
    // Preserve original relative format for reporting
    const originalRelative = importPath.startsWith('.') ?
        importPath :
        `./${importPath}`;

    const absolutePath = path.resolve(baseDir, importPath);
    const extensions = ['', '.ts', '.js', '.tsx', '.jsx'];

    // Check existence with different extensions
    for (const ext of extensions) {
        const testPath = `${absolutePath}${ext}`;
        if (fs.existsSync(testPath)) {
            return {
                exists: true,
                absolute: testPath,
                relative: path.relative(baseDir, testPath)
            };
        }
    }

    return {
        exists: false,
        absolute: absolutePath,
        relative: originalRelative
    };
}

function registerDependency(source, target, state) {
    // Add to source's imports
    if (!state.result.files[source].imports.includes(target)) {
        state.result.files[source].imports.push(target);
    }

    // Initialize target if missing
    if (!state.result.files[target]) {
        state.result.files[target] = { imports: [], exports: [] };
    }

    // Add to target's exports
    if (!state.result.files[target].exports.includes(source)) {
        state.result.files[target].exports.push(source);
    }
}

function trackUnresolved(source, unresolvedPath, state) {
    if (!state.result.unresolved[source]) {
        state.result.unresolved[source] = [];
    }

    if (!state.result.unresolved[source].includes(unresolvedPath)) {
        state.result.unresolved[source].push(unresolvedPath);
    }
}

const postProcessing = (state) => {
    delete state.currentFile;
    delete state.currentDir;
};

export { state, visitors, postProcessing };
