import traverse from "@babel/traverse";

async function executeMetric(metric, ASTs) {
    const { state, visitors, postProcessing } = await import(metric.path);

    for (const ast of ASTs) {
        traverse.default(ast, visitors, null, state);
    }

    postProcessing(state);
    return { metric: metric.name, state: state };
}

export { executeMetric };