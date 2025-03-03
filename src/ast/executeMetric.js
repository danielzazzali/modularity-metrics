import traverse from "@babel/traverse";

async function executeMetric({ state, visitors, postProcessing, ASTs }) {
    try {
        for (let i = 0; i < visitors.length; i++) {
            for (const ast of ASTs) {
                traverse.default(ast, visitors[i], null, state);
            }
        }

        if (postProcessing) {
            postProcessing(state);
        }
    } catch (error) {
        state.result = `Error: ${error.message}\n Stack trace: ${error.stack}`;
    }
    return state;
}

export { executeMetric };