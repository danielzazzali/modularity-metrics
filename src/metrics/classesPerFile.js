const state = {
    metricName: "Classes Per File",
    description: "This metric extracts the names of all classes in each file",
    version: "1.0",
    result: {},
    currentFile: null,
    currentDir: null
};

const visitors = {
    Program(pathNode, state) {
        const filePath = pathNode.parent.loc.filePath;
        const fileName = pathNode.node.loc.filename;
        const dirName = filePath.substring(0, filePath.lastIndexOf('/'));

        state.currentFile = fileName;
        state.currentDir = dirName;

        if (!state.result[state.currentDir]) {
            state.result[state.currentDir] = {};
        }

        state.result[state.currentDir][state.currentFile] = {
            classes: []
        };
    },
    ClassDeclaration(path, state) {
        const className = path.node.id.name;
        state.result[state.currentDir][state.currentFile].classes.push(className);
    },
    ClassExpression(path, state) {
        const parent = path.parent;
        let className = 'AnonymousClass';

        if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
            className = parent.id.name;
        }

        state.result[state.currentDir][state.currentFile].classes.push(className);
    }
};

const postProcessing = (state) => {
    delete state.currentFile;
    delete state.currentDir;
};

export { state, visitors, postProcessing };