import traverse from "@babel/traverse";
import {MESSAGES} from "../constants/constants.js";

async function executeMetric({ state, visitors, postProcessing, ASTs }) {
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

        if (postProcessing) {
            postProcessing(state);
        }
    } catch (error) {
        state.result = `Error: ${error.message}\n Stack trace: ${error.stack}`;
    }
    return state;
}

export { executeMetric };