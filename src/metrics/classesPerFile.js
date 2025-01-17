const state = {
    metricName: "Classes Per File",
    description: "Extracts the names of all classes in each file",
    version: "1.1",
    result: {},
    filePath: null
};

const visitors = {
    Program(pathNode, state) {
        state.filePath = pathNode.parent.loc.filePath;
        if (!state.result[state.filePath]) {
            state.result[state.filePath] = [];
        }
    },
    ClassDeclaration(pathNode, state) {
        const className = pathNode.node.id.name;
        state.result[state.filePath].push(className);
    },
    ClassExpression(pathNode, state) {
        const parentNode = pathNode.parent
        let className = 'AnonymousClass';

        if(parentNode.type === 'VariableDeclarator' && parentNode.id.type === 'Identifier') {
            className = parentNode.id.name;
        }

        state.result[state.filePath].push(className);
    }
};

const postProcessing = (state) => {
    delete state.filePath;
};

export { state, visitors, postProcessing };