import traverse from "@babel/traverse";

async function executeMetric({ state, visitors, postProcessing, ASTs }) {
    try {
        for (const ast of ASTs) {
            traverse.default(ast, visitors, null, state);
        }

        if (postProcessing) {
            postProcessing(state);
        }
    } catch (error) {
        state.result = `Error: ${error.message}`;
    }
    return state;
}

export { executeMetric };