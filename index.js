import { config } from './src/config/config.js';
import { getFiles } from "./src/files/fileReader.js";
import { getASTs } from "./src/ast/astProcessor.js";
import { executeMetric } from "./src/ast/executeMetric.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function calculateMetrics({codePath = undefined, metricsPath = undefined ,useDefaultMetrics = true} = {}) {
    config.codePath = codePath || config.codePath;
    config.metricsPath = metricsPath || config.metricsPath;

    const files = await getFiles(config.codePath);

    const ASTs = await getASTs(files);

    const results = [];

    const metricFiles = await getFiles(path.join(__dirname, 'src/metrics'));

    for (const file of metricFiles) {
        const { state, visitors, postProcessing } = await import(file.filePath);

        const result = await executeMetric({state, visitors, postProcessing, ASTs});
        results.push(result);
    }

    return results;
}

export { calculateMetrics };