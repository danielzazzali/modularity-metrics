import { calculateFanMetrics } from "./metrics/fan.js";
import { getArgs, getCustomPath } from "./utils/argumentParser.js";
import { setCustomPath } from "./utils/config.js";

/**
 * Calculate metrics based on the provided custom path and options.
 *
 * @param {string} customPath - Custom path to be used for file processing.
 * @param {Object} options - Options object.
 * @param {string} [options.path] - Custom path to be used for file processing.
 * @param {type} [options.otherOption1] - Description of otherOption1.
 * @param {type} [options.otherOption2] - Description of otherOption2.
 * @returns {Object} - The calculated metrics.
 */
function calculateMetrics(customPath, options) {
    const args = getArgs();
    setCustomPath(customPath || options.path || getCustomPath(args));
    return calculateFanMetrics();
}

export { calculateMetrics };