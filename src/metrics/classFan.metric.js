const state = {
    name: "Class Fan-In and Fan-Out",
    description: "",
    result: {},
    id: 'class-fan',
    dependencies: ['classes-per-file']
};

const visitors = {
    // Entry point for each parsed file, load dependency
    Program(path) {
        state.currentFile = path.node.filePath;
        state.result[state.currentFile] = state.dependencies['classes-per-file'][state.currentFile];
    },

    ClassMethod(path) {

    },

    ClassPrivateMethod(path) {

    },

    ClassProperty(path) {

    },

    ClassPrivateProperty(path) {

    },
};


function postProcessing(state){
    if (state.currentFile) delete state.currentFile;
    if (state.dependencies) delete state.dependencies;
}

export { state, visitors, postProcessing };
