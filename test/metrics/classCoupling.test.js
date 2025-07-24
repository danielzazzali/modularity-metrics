import path from "path";
import { calculateMetrics } from '../../src/index.js';
import {fileURLToPath} from "url";
import {describe, it, beforeAll, expect} from "@jest/globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Class Coupling Metric', function() {
    let metricsResults;

    beforeAll(async function() {
        const codePath = path.resolve(__dirname, '../src-examples/class-coupling');
        metricsResults = await calculateMetrics({ codePath });
    });

    it('has correct name and description', () => {
        const classCoupling = metricsResults['class-coupling'];
        expect(classCoupling).toHaveProperty('name', 'Class Coupling');
        expect(classCoupling).toHaveProperty('description');
        expect(classCoupling.description).toContain('Analyzes each class to identify Fan-Out and Fan-In');
    });

    it('should return status = true', function() {
        const classCoupling = metricsResults['class-coupling'];
        expect(classCoupling).toHaveProperty('status', true);
    });
});