import path from "path";
import { calculateMetrics } from '../../src/index.js';
import {fileURLToPath} from "url";
import {describe, it, beforeAll, expect} from "@jest/globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Functions Coupling Metric', function() {
    let metricsResults;

    beforeAll(async function() {
        const codePath = path.resolve(__dirname, '../src-examples/function-coupling');
        metricsResults = await calculateMetrics({ codePath });
    });

    it('has correct name and description', () => {
        const functionCoupling = metricsResults['function-coupling'];
    });

    it('should return status = true', function() {
        const functionCoupling = metricsResults['function-coupling'];
        expect(functionCoupling).toHaveProperty('status', true);
    });
});