import traverse from "@babel/traverse";
import {MESSAGES} from "../constants/constants.js";
import {kahnSort} from "../sorting/kahnSort.js";


async function executeMetrics(metricObjects, ASTs) {
    const sortedMetrics = kahnSort(metricObjects);
    const resultMap = {};

    for (const metric of sortedMetrics) {

        for (const dep of metric.state.dependencies) {
            if (!metric.state.dependencyResults) {
                metric.state.dependencyResults = {};
            }

            metric.state.dependencyResults[dep] = resultMap[dep].result;
        }

        for (const visitor of metric.visitors) {
            for (const ast of ASTs) {
                try {
                    traverse.default(ast, visitor, null, metric.state);
                } catch (error) {
                    console.error(`${MESSAGES.ERRORS.ERROR_TRAVERSING_AST} ${ast.loc.filePath}`, error);
                }
            }
        }

        if (metric.postProcessing) {
            metric.postProcessing(metric.state);
        }
        resultMap[metric.state.id] = metric.state;
    }

    return resultMap;
}

export { executeMetrics };