import path from "path";
import fs from "fs";

const state = {
    name: 'File Coupling',
    description: 'Analyzes each source file to identify and record all relative file dependencies by resolving import statements, require calls, and TypeScript import equals declarations to their absolute file paths, enabling the measurement of file coupling and module interdependencies.',
    result: {},
    id: 'file-coupling',
    dependencies: ['files']
}

const visitors = {
    // Entry point for each parsed file, load dependency
    Program(path) {
        state.currentFile = path.node.filePath;
        state.result = state.dependencies.files;
        state.result[state.currentFile] = []
    },

    ImportDeclaration(path) {
        const node = path.node;
        const importSource = node.source.value;
        const absoluteImport = resolveImportPath(state.currentFile, importSource);

        if(!absoluteImport) return;

        state.result[state.currentFile].push(absoluteImport)
    },

    CallExpression(path) {
        const node = path.node;

        if (node.callee.name === 'require' && node['arguments'].length === 1 && node['arguments'][0].type === 'StringLiteral') {
            const importSource = node['arguments'][0].value;
            const absoluteImport = resolveImportPath(state.currentFile, importSource);

            if(!absoluteImport) return;

            state.result[state.currentFile].push(absoluteImport)
        }
    },

    TSImportEqualsDeclaration(path) {
        const node = path.node;
        const importSource = node.moduleReference.expression.value;
        const absoluteImport = resolveImportPath(state.currentFile, importSource);

        if(!absoluteImport) return;

        state.result[state.currentFile].push(absoluteImport)
    },
};

function resolveImportPath(importingFile, importSource) {
    if (!importSource.startsWith('.') && !path.isAbsolute(importSource)) {
        return null;
    }

    const EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.json'];

    const basePath = path.resolve(path.dirname(importingFile), importSource);

    // 1. Exact path
    if (fs.existsSync(basePath) && fs.lstatSync(basePath).isFile()) {
        return basePath;
    }

    // 2. Try with extensions
    for (const ext of EXTENSIONS) {
        const fullPath = basePath + ext;
        if (fs.existsSync(fullPath)) {
            return fullPath;
        }
    }

    // 3. Try index files in directory
    for (const ext of EXTENSIONS) {
        const indexPath = path.join(basePath, 'index' + ext);
        if (fs.existsSync(indexPath)) {
            return indexPath;
        }
    }

    // Not found
    return null;
}

// Clean up and compute fanIn/fanOut before finishing
function postProcessing(state) {
    const raw = state.result;
    const processed = {};

    // Initialize fanOut and empty fanIn for every file found
    for (const filePath of Object.keys(raw)) {
        processed[filePath] = {
            fanOut: raw[filePath],
            fanIn: []
        };
    }

    // Invert relationships to compute fanIn
    for (const [filePath, imports] of Object.entries(raw)) {
        for (const importedPath of imports) {
            if (!processed[importedPath]) {
                processed[importedPath] = { fanOut: [], fanIn: [] };
            }
            processed[importedPath].fanIn.push(filePath);
        }
    }

    // Replace state.result with processed coupling data
    state.result = processed;

    // Remove internal state properties
    delete state.currentFile;
    delete state.dependencies;
}


export { state, visitors, postProcessing };