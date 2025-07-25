const state = {
    name: 'Files on Repository',
    description: 'Scans the codePath and records each source file by its path, initializing an empty array as a placeholder for future per-file data.',
    result: {},
    id: 'files',
    status: false
};

const visitors = {
    /* Examples:
       /src/file.js
       /src/utils/helper.ts
    */
    Program(path) {
        state.currentFile = path.node.filePath;
        if (state.currentFile) {
            if (!state.result[state.currentFile]) {
                state.result[state.currentFile] = {};
            }
        }
    }
};

// Clean up state before finishing
function postProcessing(state){
    if (state.currentFile) delete state.currentFile;
    if (state.dependencies) delete state.dependencies;

    state.status = true;
}


export { state, visitors, postProcessing };