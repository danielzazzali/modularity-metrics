#!/usr/bin/env node

import { calculateFanMetrics } from "./metrics/fan.js";
import { getArgs, getCustomPath } from "./utils/argumentParser.js";
import { setCustomPath } from "./utils/config.js";
import { fileURLToPath } from 'url';
import path from 'path';
import { prettyPrint } from "./utils/output.js";

/**
 * Get the current file's path in ES modules.
 * `import.meta.url` gives the URL of the current module, and
 * `fileURLToPath(import.meta.url)` converts it to a file path.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Calculate metrics based on the provided custom path and options.
 *
 * This function computes fan metrics by reading the specified files
 * and applying analysis based on the configuration provided through
 * command-line arguments or function parameters.
 *
 * @param {string} customPath - The custom path to be used for file processing.
 * @param {Object} options - An object containing options for metric calculation.
 * @param args
 * @param {string} [options.path] - Optional path that overrides the command-line or default path.
 * @param {type} [options.otherOption1] - Placeholder for additional options.
 * @param {type} [options.otherOption2] - Placeholder for additional options.
 * @returns {Object} - The calculated metrics in a JSON-like format.
 */
function calculateMetrics(customPath, options, args = getArgs()) {
    // Set the custom path for metric calculation, prioritizing function arguments over CLI args
    setCustomPath(customPath || options.path || getCustomPath(args));
    return calculateFanMetrics(); // Perform the metric calculations
}

/**
 * If the script is executed directly (from the command line),
 * this block runs the default behavior for CLI execution.
 */
if (import.meta.url === `file://${path.resolve(__filename)}`) {
    const args = getArgs(); // Capture command-line arguments
    const result = calculateMetrics(getCustomPath(args), {}, args); // Run the metrics calculation
    prettyPrint(result); // Output the result as a formatted JSON string
}

// Export the function for use as a module in other scripts
export { calculateMetrics };
