const state = {
    name: 'Functions Per File',
    description: 'Collects all function declarations, function expressions, and arrow functions in each file, grouping them by file path based on the “files” dependency.',
    result: {},
    id: 'functions-per-file',
    dependencies: ['files']
}

const visitors = [
    {
        Program(path) {
            state.currentFile = path.node.filePath;
            state.result = state.dependencies.files;
        },

        FunctionDeclaration(path) {
            const node = path.node;
            state.result[state.currentFile].push(node);
        },

        FunctionExpression(path) {
            const node = path.node;
            state.result[state.currentFile].push(node);
        },

        ArrowFunctionExpression(path) {
            const node = path.node;
            state.result[state.currentFile].push(node);
        },
    }
]

function postProcessing(state){
    if (state.currentFile) delete state.currentFile;
    if (state.dependencies) delete state.dependencies;
}

export { state, visitors, postProcessing };