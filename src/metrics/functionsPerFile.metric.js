const state = {
    name: 'Functions Per File',
    description: 'Collects all function declarations, function expressions, and arrow functions in each file, grouping them by file path based on the “files” dependency.',
    result: {},
    id: 'functions-per-file',
    dependencies: ['files']
}

const visitors = {
    // Entry point for each parsed file, load dependency and create functions array for each file
    Program(path) {
        state.currentFile = path.node.filePath;
        state.result = state.dependencies.files;
        state.result[state.currentFile]['functions'] = [];
    },

    /* Examples:
       function foo() {}
       async function bar() {}
    */
    FunctionDeclaration(path) {
        state.result[state.currentFile]['functions'].push(path.node);
    },

    /* Examples:
       const baz = function() {}
       const qux = async function() {}
    */
    FunctionExpression(path) {
        state.result[state.currentFile]['functions'].push(path.node);
    },

    /* Examples:
       const add = () => {}
       items.map(item => item.value)
    */
    ArrowFunctionExpression(path) {
        state.result[state.currentFile]['functions'].push(path.node);
    },
};

// Clean up state before finishing
function postProcessing(state){
    if (state.currentFile) delete state.currentFile;
    if (state.dependencies) delete state.dependencies;
}

export { state, visitors, postProcessing };