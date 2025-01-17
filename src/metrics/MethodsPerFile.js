const state = {
    metricName: "Methods Per File",
    description: "This metric extracts the names of all methods in each file, excluding class methods",
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
            methods: []
        };
    },
    ObjectMethod(pathNode, state) {
        if (pathNode.node.key && pathNode.node.key.name) {
            const methodName = pathNode.node.key.name;
            state.result[state.currentDir][state.currentFile].methods.push(methodName);
        }
    },
    FunctionDeclaration(pathNode, state) {
        if (pathNode.node.id && pathNode.node.id.name) {
            const methodName = pathNode.node.id.name;
            state.result[state.currentDir][state.currentFile].methods.push(methodName);
        }
    },
    ArrowFunctionExpression(pathNode, state) {
        if (pathNode.parent.type === 'VariableDeclarator' && pathNode.parent.id && pathNode.parent.id.type === 'Identifier') {
            state.result[state.currentDir][state.currentFile].methods.push(pathNode.parent.id.name);
        }
    },
    FunctionExpression(pathNode, state) {
        if (pathNode.parent.type === 'VariableDeclarator' && pathNode.parent.id && pathNode.parent.id.type === 'Identifier') {
            state.result[state.currentDir][state.currentFile].methods.push(pathNode.parent.id.name);
        } else if (pathNode.parent.type === 'CallExpression' && pathNode.parent.callee.type === 'MemberExpression' && pathNode.parent.callee.property.name === 'bind') {
            const methodName = pathNode.parent.callee.object.name;
            state.result[state.currentDir][state.currentFile].methods.push(methodName);
        } else if (pathNode.parent.type === 'CallExpression' && pathNode.parent.callee.type === 'Identifier' && pathNode.parent.callee.name === 'setTimeout') {
            state.result[state.currentDir][state.currentFile].methods.push('anonymousFunction');
        }
    },
    CallExpression(pathNode, state) {
        if (pathNode.node.callee.type === 'FunctionExpression') {
            state.result[state.currentDir][state.currentFile].methods.push('IIFE');
        }
    },
    Property(pathNode, state) {
        if (pathNode.node.value && (pathNode.node.value.type === 'FunctionExpression' || pathNode.node.value.type === 'ArrowFunctionExpression')) {
            if (pathNode.node.computed && pathNode.node.key.type === 'Literal') {
                const methodName = pathNode.node.key.value;
                state.result[state.currentDir][state.currentFile].methods.push(methodName);
            } else if (pathNode.node.key.type === 'Identifier') {
                const methodName = pathNode.node.key.name;
                state.result[state.currentDir][state.currentFile].methods.push(methodName);
            }
        }
    },
    VariableDeclarator(pathNode, state) {
        if (pathNode.node.init && pathNode.node.init.type === 'CallExpression' && pathNode.node.init.callee.type === 'MemberExpression' && pathNode.node.init.callee.property.name === 'bind') {
            const methodName = pathNode.node.id.name;
            state.result[state.currentDir][state.currentFile].methods.push(methodName);
        }
    }
};

function postProcessing(state) {
    delete state.currentFile;
    delete state.currentDir;
}

export { state, visitors, postProcessing };