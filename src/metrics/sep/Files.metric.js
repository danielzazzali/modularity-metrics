const state = {
    name: 'Files on Repository',
    description: 'Scans the codePath and records each source file by its path, initializing an empty array as a placeholder for future per-file data.',
    result: {},
    id: 'files',
}

const visitors = [
    {
        Program(path) {
            state.currentFile = path.node.filePath;
            if (state.currentFile) initFileEntry();
        }
    }
]


function initFileEntry(){
    if (!state.result[state.currentFile]) {
        state.result[state.currentFile] = [];
    }
}

function postProcessing(state){
    if (state.currentFile) delete state.currentFile;
    if (state.dependencies) delete state.dependencies;
}


export { state, visitors, postProcessing };