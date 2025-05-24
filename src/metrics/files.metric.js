const state = {
    name: 'Files on Repository',
    description: 'Scans the codePath and records each source file by its path, initializing an empty array as a placeholder for future per-file data.',
    result: {},
    id: 'files',
}

const visitors = [
    {
        /* Examples:
           /src/file1.js
           /src/utils/helper.ts
        */
        Program(path) {
            state.currentFile = path.node.filePath;
            if (state.currentFile) initFileEntry();
        }
    }
]

// Ensure a file entry exists in the result map
function initFileEntry(){
    if (!state.result[state.currentFile]) {
        state.result[state.currentFile] = {};
    }
}

// Clean up state before finishing
function postProcessing(state){
    if (state.currentFile) delete state.currentFile;
    if (state.dependencies) delete state.dependencies;
}


export { state, visitors, postProcessing };