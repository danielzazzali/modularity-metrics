import { config } from './config/config.js';
import { getFiles } from "./files/fileReader.js";
import { getASTs } from "./ast/astProcessor.js";
import { executeMetric } from "./ast/executeMetric.js";
import { MESSAGES } from "./constants/constants.js";
import { importMetric, loadMetrics } from "./loader/metricsLoader.js";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function calculateMetrics({ codePath, customMetricsPath, useDefaultMetrics } = {}) {
    config.codePath = codePath;
    config.customMetricsPath = customMetricsPath;
    config.useDefaultMetrics = useDefaultMetrics;

    if (!config.useDefaultMetrics && !config.customMetricsPath) {
        throw new Error(MESSAGES.ERRORS.ERROR_NO_METRICS);
    }

    const files = await getFiles(config.codePath);
    const ASTs = await getASTs(files);
    const results = [];

    const metricFiles = await loadMetrics({ useDefaultMetrics: config.useDefaultMetrics, metricsPath: config.customMetricsPath, __dirname });

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