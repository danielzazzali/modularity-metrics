import { getFiles } from "../files/fileReader.js";
import { MESSAGES } from "../constants/constants.js";
import path from "path";
import { METRICS_PATH } from "../constants/constants.js";

async function loadMetrics({ useDefaultMetrics, metricsPath, __dirname}) {
    let metricFiles = [];

    if (useDefaultMetrics) {
        metricFiles = await getFiles(path.join(__dirname, METRICS_PATH));
    }

    if (metricsPath) {
        const additionalMetricFiles = await getFiles(metricsPath);
        metricFiles = metricFiles.concat(additionalMetricFiles);
    }

    return metricFiles;
}

async function importMetric(file) {
    const { state, visitors, postProcessing } = await import(file.filePath);

    if (!state || !visitors) {
        console.error(`${MESSAGES.ERRORS.PROCESSING_ERROR} ${file.filePath}: ${MESSAGES.ERRORS.MISSING_EXPORTS}`);
        return { error: `${MESSAGES.ERRORS.PROCESSING_ERROR} ${file.filePath}: ${MESSAGES.ERRORS.MISSING_EXPORTS}` };
    }

    return { state, visitors, postProcessing };
}

export { loadMetrics, importMetric };