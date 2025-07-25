import path from "path";
import { calculateMetrics } from '../../src/index.js';
import {fileURLToPath} from "url";
import {describe, it, beforeAll, expect} from "@jest/globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Class Coupling Metric', function () {
    const codePath = path.resolve(__dirname, '../src-examples/class-coupling');
    const jsFile = path.resolve(__dirname, '../src-examples/class-coupling/JS/classes-coupled.js');
    const tsFile = path.resolve(__dirname, '../src-examples/class-coupling/TS/classes-coupled.ts');
    let metricsResults;

    beforeAll(async function() {
        metricsResults = await calculateMetrics({codePath});
    });

    it('codePath is defined', () => {
        expect(codePath).toBeDefined();
    })

    it('jsFile is defined', () => {
        expect(jsFile).toBeDefined();
    });

    it('tsFile is defined', () => {
        expect(tsFile).toBeDefined();
    });

    it('metricsResults is defined', () => {
        expect(metricsResults).toBeDefined();
    });

    it('Metric is defined, has correct name, description and status and contains result', () => {
        expect(metricsResults).toHaveProperty('class-coupling');
        expect(metricsResults['class-coupling']).toHaveProperty('name', 'Class Coupling');
        expect(metricsResults['class-coupling']['description']).toBeDefined();
        expect(metricsResults['class-coupling']['description']).toContain('Analyzes each class to identify Fan-Out and Fan-In');
        expect(metricsResults['class-coupling']['result']).toBeDefined();
        expect(metricsResults['class-coupling']['status']).toBeTruthy();
    });

    it('Metric result contains JS src testing file', () => {
        expect(metricsResults['class-coupling']['result'][jsFile]).toBeDefined();
    });

    it('Metric result contains TS src testing file', () => {
        expect(metricsResults['class-coupling']['result'][tsFile]).toBeDefined();
    });

    it('Should compute the correct metric structure for JS file', function() {

    });

    it('should compute the correct metric structure for TS file', function() {

        expect(metricsResults['class-coupling']['result'][tsFile]).toBeDefined();
    });
});