import { getFiles } from "../files/fileReader.js";
import {MESSAGES, REGEX_METRICS_ID} from "../constants/constants.js";
import path from "path";
import { METRICS_PATH } from "../constants/constants.js";
import { logger } from "../logger/logger.js";

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
    const { state, visitors, postProcessing } = await import(file.filePath);

    if (!state || !visitors) {
        throw new Error(`${MESSAGES.ERRORS.PROCESSING_ERROR} ${file.filePath}: ${MESSAGES.ERRORS.MISSING_EXPORTS}`);
    }

    if(!state.id) {
        throw new Error(`${MESSAGES.ERRORS.METRIC_HAS_NO_ID} ${JSON.stringify(state)}`);
    }

    if (!REGEX_METRICS_ID.test(state.id)) {
        throw new Error(`${MESSAGES.ERRORS.ERROR_INVALID_METRIC_ID} ${state.id}: ${MESSAGES.ERRORS.ID_MUST_MATCH_REGEX} ${REGEX_METRICS_ID}`);
    }

    return { state, visitors, postProcessing };
}

async function loadMetricObjects(metricFiles) {
    const metricsObjects = [];

    for (const file of metricFiles) {
        try {
            const metric = await importMetric(file);
            metricsObjects.push(metric);
        } catch (error) {
            logger.logMetricError(error.message);
        }
    }

    return metricsObjects;
}

export { loadMetricObjects };