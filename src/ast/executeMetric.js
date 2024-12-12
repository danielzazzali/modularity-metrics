import traverse from "@babel/traverse";

async function executeMetric({ state, visitors, postProcessing, ASTs }) {
    for (const ast of ASTs) {
        traverse.default(ast, visitors, null, state);
    }

    postProcessing(state);
    return state;
}

export { executeMetric };