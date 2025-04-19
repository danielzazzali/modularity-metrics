import traverse from "@babel/traverse";
import {MESSAGES} from "../constants/constants.js";
import {kahnSort} from "../sorting/kahnSort.js";

//
// async function executeMetricOnASTs(state, visitors, ASTs) {
//     try {
//         for (let i = 0; i < visitors.length; i++) {
//             for (const ast of ASTs) {
//                 try {
//                     traverse.default(ast, visitors[i], null, state);
//                 } catch (error) {
//                     console.error(`${MESSAGES.ERRORS.ERROR_TRAVERSING_AST} ${ast.loc.filePath}`)
//                 }
//             }
//         }
//     } catch (error) {
//         state.result = error;
//     }
//
//     return state;
// }


function sortMetricsByDependencies(metricsObjects) {

}

async function executeMetrics(metricObjects, ASTs) {
    const sorted = kahnSort(metricObjects);



    // TODO: Execute metrics in topological order


    // TODO: Return result
    return null;
}

export { executeMetrics };