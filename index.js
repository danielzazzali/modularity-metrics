import { config } from './src/config/config.js';
import { DEFAULT_METRICS } from "./src/metrics/index.js";
import { getFiles } from "./src/files/fileReader.js";
import { MESSAGES } from "./src/constants/constants.js";
import { getASTs } from "./src/ast/astProcessor.js";
import { executeMetric } from "./src/ast/executeMetric.js";


async function calculateMetrics({path = undefined, metrics = [], useDefaultMetrics = true} = {}) {
    config.path = path || config.path;

    if (metrics.length === 0 && !useDefaultMetrics) {
        throw new Error(MESSAGES.ERRORS.ERROR_NO_METRICS);
    }

    const metricsToLoad = metrics.length === 0
        ? DEFAULT_METRICS
        : (useDefaultMetrics ? [...DEFAULT_METRICS, ...metrics] : metrics);

    const files = await getFiles();
    const ASTs = await getASTs(files);

    const results = [];

    for (const metric of metricsToLoad) {
        const result = await executeMetric(metric, ASTs);
        results.push(result);
    }

    return results;
}

export { calculateMetrics };