import traverse from "@babel/traverse";

async function executeMetric({ state, visitors, postProcessing, ASTs }) {
    try {
        for (const ast of ASTs) {
            for (const group of visitors) {
                traverse.default(ast, group, null, state);
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