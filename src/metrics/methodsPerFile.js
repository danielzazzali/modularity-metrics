const state = {
    metricName: "Methods Per File",
    description: "This metric counts the number of methods in each file.",
    version: "0.0.1",
    results: {},
    currentFile: null
};

const visitors = {
    Program(pathNode, state) {
        state.currentFile = pathNode.node.loc.filename;
    },
    ClassMethod(pathNode, state) {
        const fileName = state.currentFile;
        if (!state.results[fileName]) {
            state.results[fileName] = [];
        }
        state.results[fileName].push(pathNode.node.key.name);
    },
    ObjectMethod(pathNode, state) {
        const fileName = state.currentFile;
        if (!state.results[fileName]) {
            state.results[fileName] = [];
        }
        state.results[fileName].push(pathNode.node.key.name);
    },
    FunctionDeclaration(pathNode, state) {
        const fileName = state.currentFile;
        if (!state.results[fileName]) {
            state.results[fileName] = [];
        }
        state.results[fileName].push(pathNode.node.id.name);
    },
    ArrowFunctionExpression(pathNode, state) {
        const fileName = state.currentFile;
        if (pathNode.parent.type === 'VariableDeclarator' && pathNode.parent.id.type === 'Identifier') {
            if (!state.results[fileName]) {
                state.results[fileName] = [];
            }
            state.results[fileName].push(pathNode.parent.id.name);
        }
    },
    FunctionExpression(pathNode, state) {
        const fileName = state.currentFile;
        if (pathNode.parent.type === 'VariableDeclarator' && pathNode.parent.id.type === 'Identifier') {
            if (!state.results[fileName]) {
                state.results[fileName] = [];
            }
            state.results[fileName].push(pathNode.parent.id.name);
        }
    }
};

function postProcessing(state) {
    delete state.currentFile;
}

export { state, visitors, postProcessing };