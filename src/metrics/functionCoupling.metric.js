const state = {
    name: 'Functions Coupling',
    description: 'Analyzes each function to identify Fan-Out and Fan-In',
    result: {},
    id: 'function-coupling',
    dependencies: ['functions-per-file'],
    status: false
}

const visitors = {
    // Entry point for each parsed file, load dependency and create functions array for each file
    Program(path) {
        state.currentFile = path.node.filePath;
        state.result = state.dependencies['functions-per-file'];
    },

    /* Examples:
       function foo() {}
       async function bar() {}
    */
    FunctionDeclaration(path) {
        let callerFunction = '';

        if (path.node.id && path.node.id.name) {
            callerFunction = path.node.id.name;
        } else if (path.parentPath.node.type === 'VariableDeclarator' && path.parentPath.node.id.name) {
            callerFunction = path.parentPath.node.id.name;
        } else {
            return;
        }

        path.traverse({
            CallExpression(innerPath) {
                if (!innerPath.node.callee || !innerPath.node.callee.name) {
                    return;
                }

                const calleeFunction = innerPath.node.callee.name;

                if (!state.result[state.currentFile][callerFunction]) {
                    state.result[state.currentFile][callerFunction] = {}
                }

                if (!state.result[state.currentFile][callerFunction]['fan-out'] ) {
                    state.result[state.currentFile][callerFunction]['fan-out'] = {}
                }

                if (!state.result[state.currentFile][callerFunction]['fan-out'][calleeFunction]) {
                    state.result[state.currentFile][callerFunction]['fan-out'][calleeFunction] = 0;
                }

                state.result[state.currentFile][callerFunction]['fan-out'][calleeFunction]++

                if (!state.result[state.currentFile][calleeFunction]) {
                    state.result[state.currentFile][calleeFunction] = {}
                }

                if (!state.result[state.currentFile][calleeFunction]['fan-in'] ) {
                    state.result[state.currentFile][calleeFunction]['fan-in'] = {}
                }

                if (!state.result[state.currentFile][calleeFunction]['fan-in'][callerFunction]) {
                    state.result[state.currentFile][calleeFunction]['fan-in'][callerFunction] = 0;
                }

                state.result[state.currentFile][calleeFunction]['fan-in'][callerFunction]++
            }
        })
    },

    /* Examples:
       const baz = function() {}
       const qux = async function() {}
    */
    FunctionExpression(path) {
        let callerFunction = '';

        if (path.node.id && path.node.id.name) {
            callerFunction = path.node.id.name;
        } else if (path.parentPath.node.type === 'VariableDeclarator' && path.parentPath.node.id.name) {
            callerFunction = path.parentPath.node.id.name;
        } else {
            return;
        }

        path.traverse({
            CallExpression(innerPath) {
                if (!innerPath.node.callee || !innerPath.node.callee.name) {
                    return;
                }

                const calleeFunction = innerPath.node.callee.name;

                if (!state.result[state.currentFile][callerFunction]) {
                    state.result[state.currentFile][callerFunction] = {}
                }

                if (!state.result[state.currentFile][callerFunction]['fan-out'] ) {
                    state.result[state.currentFile][callerFunction]['fan-out'] = {}
                }

                if (!state.result[state.currentFile][callerFunction]['fan-out'][calleeFunction]) {
                    state.result[state.currentFile][callerFunction]['fan-out'][calleeFunction] = 0;
                }

                state.result[state.currentFile][callerFunction]['fan-out'][calleeFunction]++

                if (!state.result[state.currentFile][calleeFunction]) {
                    state.result[state.currentFile][calleeFunction] = {}
                }

                if (!state.result[state.currentFile][calleeFunction]['fan-in'] ) {
                    state.result[state.currentFile][calleeFunction]['fan-in'] = {}
                }

                if (!state.result[state.currentFile][calleeFunction]['fan-in'][callerFunction]) {
                    state.result[state.currentFile][calleeFunction]['fan-in'][callerFunction] = 0;
                }

                state.result[state.currentFile][calleeFunction]['fan-in'][callerFunction]++
            }
        })
    },

    /* Examples:
       const add = () => {}
       items.map(item => item.value)
    */
    ArrowFunctionExpression(path) {
        let callerFunction = '';

        if (path.node.id && path.node.id.name) {
            callerFunction = path.node.id.name;
        } else if (path.parentPath.node.type === 'VariableDeclarator' && path.parentPath.node.id.name) {
            callerFunction = path.parentPath.node.id.name;
        } else {
            return;
        }

        path.traverse({
            CallExpression(innerPath) {
                if (!innerPath.node.callee || !innerPath.node.callee.name) {
                    return;
                }

                const calleeFunction = innerPath.node.callee.name;

                if (!state.result[state.currentFile][callerFunction]) {
                    state.result[state.currentFile][callerFunction] = {}
                }

                if (!state.result[state.currentFile][callerFunction]['fan-out'] ) {
                    state.result[state.currentFile][callerFunction]['fan-out'] = {}
                }

                if (!state.result[state.currentFile][callerFunction]['fan-out'][calleeFunction]) {
                    state.result[state.currentFile][callerFunction]['fan-out'][calleeFunction] = 0;
                }

                state.result[state.currentFile][callerFunction]['fan-out'][calleeFunction]++

                if (!state.result[state.currentFile][calleeFunction]) {
                    state.result[state.currentFile][calleeFunction] = {}
                }

                if (!state.result[state.currentFile][calleeFunction]['fan-in'] ) {
                    state.result[state.currentFile][calleeFunction]['fan-in'] = {}
                }

                if (!state.result[state.currentFile][calleeFunction]['fan-in'][callerFunction]) {
                    state.result[state.currentFile][calleeFunction]['fan-in'][callerFunction] = 0;
                }

                state.result[state.currentFile][calleeFunction]['fan-in'][callerFunction]++
            }
        })
    },
};


// Clean up state before finishing
function postProcessing(state){
    if (state.currentFile) delete state.currentFile;
    if (state.dependencies) delete state.dependencies;

    state.status = true;
}

export { state, visitors, postProcessing };