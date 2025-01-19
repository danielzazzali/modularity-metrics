const state = {
    metricName: "Functions And Methods Per File",
    description: "This metric extracts the signature of all functions and methods in a file.",
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
    FunctionDeclaration(pathNode, state) {
        const isAsync = pathNode.node.async ? 'async ' : '';
        const isGenerator = pathNode.node.generator ? '*' : ''
        const functionName = pathNode.node.id.name;
        const params = pathNode.node.params.map(param => param.name).join(', ');
        const functionSignature = `${isAsync}function${isGenerator} ${functionName}(${params})`;
        state.result[state.filePath].push(functionSignature)
    },
    FunctionExpression(pathNode, state) {
        let isAsync = pathNode.node.async ? 'async ' : '';
        let isGenerator = pathNode.node.generator ? '*' : ''
        const params = pathNode.node.params.map(param => param.name).join(', ');
        if (pathNode.parent.type === 'VariableDeclarator' && pathNode.parent.id && pathNode.parent.id.name) {
            const functionName = pathNode.parent.id.name;
            const functionSignature = `${isAsync}function${isGenerator} ${functionName}(${params})`;
            state.result[state.filePath].push(functionSignature)
        } else if (pathNode.parent.type === 'CallExpression') {
            let functionName = '{AnonymousFunction}'
            if (pathNode.node.id && pathNode.node.id.name) {
                functionName = pathNode.node.id.name;
            }
            const functionSignature = `${isAsync}function${isGenerator} ${functionName}(${params})`;
            state.result[state.filePath].push(functionSignature)
        } else if (pathNode.parent.type === 'ObjectProperty') {
            const parent = pathNode.findParent((p) => p.isObjectExpression());
            let grandparent;
            if (parent) {
                grandparent = parent.findParent((p) => p.isVariableDeclarator());
            }
            isAsync = pathNode.node.async ? 'async ' : '';
            isGenerator = pathNode.node.generator ? '* ' : ''
            const methodName = pathNode.parent.key.name;
            const name = pathNode.parent.computed ? `[${methodName}]` : methodName
            const objectName = grandparent.node.id.name;
            const functionSignature = `${isAsync}${isGenerator}${objectName}.${name}(${params})`;
            state.result[state.filePath].push(functionSignature)
        } else {
            const functionName = '{AnonymousFunction}';
            const functionSignature = `${isAsync}function${isGenerator} ${functionName}(${params})`;
            state.result[state.filePath].push(functionSignature)
        }
    },
    ArrowFunctionExpression(pathNode, state) {
        const isAsync = pathNode.node.async ? 'async ' : '';
        const isGenerator = pathNode.node.generator ? '*' : ''
        if (pathNode.parent.type === 'VariableDeclarator' && pathNode.parent.id && pathNode.parent.id.name) {
            const functionName = pathNode.parent.id.name;
            const params = pathNode.node.params.map(param => param.name).join(', ');
            const functionSignature = `${isAsync}function${isGenerator} ${functionName}(${params}) =>`;
            state.result[state.filePath].push(functionSignature)
        }
    },
    ObjectMethod(pathNode, state) {
        const parent = pathNode.findParent((p) => p.isObjectExpression());
        let grandparent;
        if (parent) {
            grandparent = parent.findParent((p) => p.isVariableDeclarator());
        }
        if(grandparent) {
            const isAsync = pathNode.node.async ? 'async ' : '';
            const isGenerator = pathNode.node.generator ? '* ' : ''
            const methodName = pathNode.node.key.name;
            const name = pathNode.node.computed ? `[${methodName}]` : methodName
            const objectName = grandparent.node.id.name;
            const params = pathNode.node.params.map(param => param.name).join(', ');
            const functionSignature = `${isAsync}${isGenerator}${objectName}.${name}(${params})`;
            state.result[state.filePath].push(functionSignature)
        }
    }
};


function postProcessing(state) {
    delete state.filePath;
}

export { state, visitors, postProcessing };