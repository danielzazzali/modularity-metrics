import traverse from "@babel/traverse";
import {MESSAGES} from "../constants/constants.js";

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


/*
L ← empty list
while S not empty:
  remove a vertex v from S
  append v to L
  for each edge (v→w):
    remove that edge
    decrement indegree[w]
    if indegree[w] == 0:
      add w to S
*/
function sortMetricsByDependencies(metricsObjects) {

}

async function executeMetrics(metricsObjects, ASTs) {
    // TODO: Topological sort the metrics by dependencies


    // TODO: Execute metrics in topological order


    // TODO: Return result
}

export { executeMetrics };