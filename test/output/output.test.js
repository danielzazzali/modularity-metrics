import path from "path";
import { calculateMetrics } from '../../src/index.js';
import {fileURLToPath} from "url";
import {describe, it, beforeAll, expect} from "@jest/globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Functions Coupling Metric', function() {
    const codePath = path.resolve(__dirname, '../src-examples/function-coupling');
    let metricsResults;

    beforeAll(async function() {
        metricsResults = await calculateMetrics({codePath});
    });

    it('codePath is defined', () => {
        expect(codePath).toBeDefined();
    })

    it('metricsResults is defined', () => {
        expect(metricsResults).toBeDefined();
    });

    it('Should contain metric files with status true', function() {
        expect(metricsResults['files']).toHaveProperty('status', true);
    });

    it('Should contain metric functions-per-file with status true', function() {
        expect(metricsResults['functions-per-file']).toHaveProperty('status', true);
    });

    it('Should contain metric file-coupling with status true', function() {
        expect(metricsResults['file-coupling']).toHaveProperty('status', true);
    });

    it('Should contain metric function-coupling with status true', function() {
        expect(metricsResults['function-coupling']).toHaveProperty('status', true);
    });

    it('Should contain metric classes-per-file with status true', function() {
        expect(metricsResults['classes-per-file']).toHaveProperty('status', true);
    });

    it('Should contain metric class-coupling with status true', function() {
        expect(metricsResults['class-coupling']).toHaveProperty('status', true);
    });

    it('Should not contain metric instance-mapper (helper metric)', function() {
        expect(metricsResults['instance-mapper']).toBeUndefined();
    });
});