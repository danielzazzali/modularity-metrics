import { traverseASTs } from "../ast/astTraversal.js";

function getVisitors() {
    return {
        ClassMethod(pathNode, state) {
            state.results.push(pathNode.node.key.name);
        },
        ObjectMethod(pathNode, state) {
            state.results.push(pathNode.node.key.name);
        },
        FunctionDeclaration(pathNode, state) {
            state.results.push(pathNode.node.id.name);
        },
        ArrowFunctionExpression(pathNode, state) {
            if (pathNode.parent.type === 'VariableDeclarator' && pathNode.parent.id.type === 'Identifier') {
                state.results.push(pathNode.parent.id.name);
            }
        },
        FunctionExpression(pathNode, state) {
            if (pathNode.parent.type === 'VariableDeclarator' && pathNode.parent.id.type === 'Identifier') {
                state.results.push(pathNode.parent.id.name);
            }
        }
    };
}

function calculateMethodsPerFile() {
    const visitors = getVisitors();
    const ASTResults = traverseASTs(visitors);

    const methodsPerFile = {};

    ASTResults.forEach(({ fileName, results: methods }) => {
        methodsPerFile[fileName] = methods;
    });

    return methodsPerFile;
}

export { calculateMethodsPerFile };