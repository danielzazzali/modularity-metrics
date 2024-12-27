import { config } from './src/config/config.js';
import { getFiles } from "./src/files/fileReader.js";
import { getASTs } from "./src/ast/astProcessor.js";
import { executeMetric } from "./src/ast/executeMetric.js";
import { MESSAGES, METRICS_PATH } from "./src/constants/constants.js";
import { importMetric, loadMetrics } from "./src/loader/metricsLoader.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function calculateMetrics({ codePath, metricsPath, useDefaultMetrics } = {}) {
    config.codePath = codePath;
    config.metricsPath = metricsPath;
    config.useDefaultMetrics = useDefaultMetrics;

    if (!config.useDefaultMetrics && !config.metricsPath) {
        throw new Error(MESSAGES.ERRORS.ERROR_NO_METRICS);
    }

    const files = await getFiles(config.codePath);
    const ASTs = await getASTs(files);
    const results = [];

    const metricFiles = await loadMetrics({ useDefaultMetrics: config.useDefaultMetrics, metricsPath: config.metricsPath, __dirname });

    for (const file of metricFiles) {
        const metric = await importMetric(file);

        if (metric.error) {
            results.push(metric);
            continue;
        }

        const result = await executeMetric({ ...metric, ASTs });
        results.push(result);
    }

    return results;
}

export { calculateMetrics };