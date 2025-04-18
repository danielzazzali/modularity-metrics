import traverse from "@babel/traverse";
import {MESSAGES} from "../constants/constants.js";

async function executeMetricOnASTs(state, visitors, ASTs) {
    try {
        for (let i = 0; i < visitors.length; i++) {
            for (const ast of ASTs) {
                try {
                    traverse.default(ast, visitors[i], null, state);
                } catch (error) {
                    console.error(`${MESSAGES.ERRORS.ERROR_TRAVERSING_AST} ${ast.loc.filePath}`)
                }
            }
        }
    } catch (error) {
        state.result = error;
    }

    return state;
}

async function executeMetrics(metricsObjects, ASTs) {
    // TODO: Topological sort the metrics


    // TODO: Execute metrics in topological order


    // TODO: Return result
}

export { executeMetrics };