const state = {
    functionNames: [],
};

const visitors = {
    FunctionDeclaration(path, state) {
        state.functionNames.push(path.node.id.name);
    },
};

const postProcessing = (state) => {
    state.functionNames = state.functionNames.sort();
}

export { state, visitors, postProcessing };