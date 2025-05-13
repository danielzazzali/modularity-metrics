import { getFiles } from "./files/fileReader.js";
import { constructASTs } from "./ast/astProcessor.js";
import { executeMetrics } from "./ast/executeMetric.js";
import { MESSAGES } from "./constants/constants.js";
import { loadMetricFiles, loadMetricObjects } from "./loader/metricsLoader.js";
import { fileURLToPath } from "url";
import path from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function calculateMetrics({ codePath, customMetricsPath, useDefaultMetrics } = {}) {
    if (!useDefaultMetrics && !customMetricsPath) {
        throw new Error(MESSAGES.ERRORS.ERROR_NO_METRICS);
    }

    const codeFiles = await getFiles(codePath);
    const ASTs = await constructASTs(codeFiles);

    const metricFiles = await loadMetricFiles(useDefaultMetrics, customMetricsPath, __dirname);
    const metricObjects = await loadMetricObjects(metricFiles);

    return await executeMetrics(metricObjects, ASTs);
}

export { calculateMetrics };