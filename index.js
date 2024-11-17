import { config } from './src/config/config.js';
import { METRIC_TYPES, METRIC_PATHS, MESSAGES } from './src/constants/constants.js';

/**
 * Dynamically calculates selected metrics based on the provided options.
 * @param {Object} options The options object containing the path and metrics to calculate.
 * @param {string} options.path The path to the source code files.
 * @param {Array<string>} options.metricsToCalculate The list of metrics to calculate (from MetricTypes Enum).
 * @returns {Object} The calculated metrics.
 */
async function calculateMetrics({ path, metricsToCalculate = [] }) {
    config.customPath = path;

    const metricsResults = {};
    const availableMetrics = Object.values(METRIC_TYPES);

    // Iterate through the selected metrics
    for (const metric of metricsToCalculate) {
        // Check if the metric exists in the MetricTypes enum
        if (availableMetrics.includes(metric)) {
            // Dynamically import and calculate the selected metric
            switch (metric) {
                case METRIC_TYPES.FAN_IN_FAN_OUT_PER_FILE:
                    const { calculateFanInFanOutPerFile } = await import(METRIC_PATHS.FAN_IN_FAN_OUT_PER_FILE);
                    metricsResults[METRIC_TYPES.FAN_IN_FAN_OUT_PER_FILE] = calculateFanInFanOutPerFile();
                    break;
                case METRIC_TYPES.FAN_IN_FAN_OUT_PER_CLASS:
                    const { calculateFanInFanOutPerClass } = await import(METRIC_PATHS.FAN_IN_FAN_OUT_PER_CLASS);
                    metricsResults[METRIC_TYPES.FAN_IN_FAN_OUT_PER_CLASS] = calculateFanInFanOutPerClass();
                    break;
                case METRIC_TYPES.CLASSES_PER_FILE:
                    const { calculateClassesPerFile } = await import(METRIC_PATHS.CLASSES_PER_FILE);
                    metricsResults[METRIC_TYPES.CLASSES_PER_FILE] = calculateClassesPerFile();
                    break;
                case METRIC_TYPES.METHODS_PER_FILE:
                    const { calculateMethodsPerFile } = await import(METRIC_PATHS.METHODS_PER_FILE);
                    metricsResults[METRIC_TYPES.METHODS_PER_FILE] = calculateMethodsPerFile();
                    break;
                default:
                    console.warn(`${MESSAGES.WARNINGS.UNRECOGNIZED_METRIC} ${metric}`);
                    break;
            }
        } else {
            console.warn(`${MESSAGES.WARNINGS.INVALID_METRIC} ${metric}`);
        }
    }

    return metricsResults;
}

export { calculateMetrics, METRIC_TYPES };