import { config } from './src/config/config.js';
import { MESSAGES } from './src/constants/constants.js';

/**
 * Calculates all metrics based on the provided metricsConfig.
 * @param {Object} options The options object containing the path and the config JSON.
 * @param {string} options.path The path to the source code files.
 * @param {Object} options.metricsConfig JSON containing metric names and their paths.
 * @returns {Object} The calculated metrics.
 */
async function calculateMetrics({ path, metricsConfig }) {
    config.customPath = path;

    const metricsResults = {};

    // Iterate through all metrics defined in the config
    for (const { name, path: metricPath } of metricsConfig.metrics) {
        try {
            const metricModule = await import(metricPath);
            if (metricModule[name]) {
                metricsResults[name] = await metricModule[name]();
            } else {
                console.warn(`${MESSAGES.WARNINGS.UNRECOGNIZED_METRIC} ${name}`);
            }
        } catch (error) {
            console.error(`${MESSAGES.ERRORS.LOADING_METRIC}${MESSAGES.ERRORS.FROM}${name}${MESSAGES.ERRORS.FROM}${metricPath}:`, error);
        }
    }

    return metricsResults;
}

export { calculateMetrics };
