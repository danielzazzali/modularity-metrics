import traverse from "@babel/traverse";
import { MESSAGES } from "../constants/constants.js";
import { kahnSort } from "../sorting/kahnSort.js";
import { logger } from "../logger/logger.js";


async function executeMetrics(metricObjects, ASTs) {
    const sortedMetrics = kahnSort(metricObjects);
    const resultMap = {};

    for (const metric of sortedMetrics) {
        if (!metric.state.dependencies)  {
            metric.state.dependencies = {};
        } else {
            for (const dep of metric.state.dependencies) {
                metric.state.dependencies = {};
                metric.state.dependencies[dep] = structuredClone(resultMap[dep]);
            }
        }

        for (const visitors of metric.visitors) {
            for (const ast of ASTs) {
                try {
                    traverse.default(ast, visitors, null, metric.state);
                } catch (error) {
                    logger.logTraverseError(`${MESSAGES.ERRORS.ERROR_TRAVERSING_AST} ${metric.state.id} ${error.message}`);
                }
            }
        }

        if (metric.postProcessing) {
            metric.postProcessing(metric.state);
        }
        resultMap[metric.state.id] = metric.state.result;
    }

    let result = {};

    for (const metric of sortedMetrics) {
        result[metric.state.id] = metric.state;
        delete result[metric.state.id].id
    }

    result.parse_errors = logger.getParseErrors();
    result.metric_errors = logger.getMetricErrors();
    result.traverse_errors = logger.getTraverseErrors();

    return result;
}

export { executeMetrics };