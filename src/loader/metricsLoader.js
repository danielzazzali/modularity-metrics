import { getFiles } from "../files/fileReader.js";
import { MESSAGES } from "../constants/constants.js";
import path from "path";
import { METRICS_PATH } from "../constants/constants.js";

export async function loadMetricFiles(useDefaultMetrics, customMetricsPath, __dirname) {
    let metricFiles = [];

    if (useDefaultMetrics) {
        metricFiles = await getFiles(path.join(__dirname, METRICS_PATH));
    }

    if (customMetricsPath) {
        const additionalMetricFiles = await getFiles(customMetricsPath);
        metricFiles = metricFiles.concat(additionalMetricFiles);
    }

    return metricFiles;
}

async function importMetric(file) {
    const { state, visitors } = await import(file.filePath);

    if (!state || !visitors) {
        throw new Error(`${MESSAGES.ERRORS.PROCESSING_ERROR} ${file.filePath}: ${MESSAGES.ERRORS.MISSING_EXPORTS}`);
    }

    return { state, visitors };
}

async function loadMetricObjects(metricFiles) {
    const metricsObjects = [];

    for (const file of metricFiles) {
        try {
            const metric = await importMetric(file);
            metricsObjects.push(metric);
        } catch (error) {
            console.error(error.message);
        }
    }

    return metricsObjects;
}

export { loadMetricObjects };