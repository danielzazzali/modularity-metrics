import path from "path";
import { calculateMetrics } from '../../src/index.js';
import {fileURLToPath} from "url";
import {describe, it, beforeAll, expect} from "@jest/globals";
import { inspect } from "util"


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Functions Coupling Metric', function () {
    const codePath = path.resolve(__dirname, '../src-examples/function-coupling');
    const jsFile = path.resolve(__dirname, '../src-examples/function-coupling/JS/functions-coupled.js');
    const tsFile = path.resolve(__dirname, '../src-examples/function-coupling/TS/functions-coupled.ts');
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
        expect(metricsResults).toHaveProperty('function-coupling');
        expect(metricsResults['function-coupling']).toHaveProperty('name', 'Functions Coupling');
        expect(metricsResults['function-coupling']['description']).toBeDefined();
        expect(metricsResults['function-coupling']['description']).toContain('Analyzes each function to identify Fan-Out and Fan-In');
        expect(metricsResults['function-coupling']['result']).toBeDefined();
        expect(metricsResults['function-coupling']['status']).toBeTruthy();
    });

    it('Metric result contains JS src testing file', () => {
        expect(metricsResults['function-coupling']['result'][jsFile]).toBeDefined();
    });

    it('Metric result contains TS src testing file', () => {
        expect(metricsResults['function-coupling']['result'][tsFile]).toBeDefined();
    });

    it('Should compute the correct metric structure for JS file', function() {
        expect(metricsResults['function-coupling']['result'][jsFile]).toEqual({
            functionA: {
                type: 'FunctionDeclaration',
                id: { type: 'Identifier', name: 'functionA' },
                generator: false,
                async: false,
                params: [],
                body: {
                    type: 'BlockStatement',
                    body: [{
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'CallExpression',
                            callee: { type: 'Identifier', name: 'functionB' },
                            arguments: []
                        }
                    }]
                },
                'fan-out': { functionB: 1 },
                'fan-in': { functionC: 1 }
            },
            functionB: {
                type: 'FunctionExpression',
                id: null,
                generator: false,
                async: false,
                params: [],
                body: {
                    type: 'BlockStatement',
                    body: [{
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'CallExpression',
                            callee: { type: 'Identifier', name: 'functionC' },
                            arguments: []
                        }
                    }]
                },
                'fan-in': { functionA: 1 },
                'fan-out': { functionC: 1 }
            },
            functionC: {
                type: 'ArrowFunctionExpression',
                id: null,
                generator: false,
                async: false,
                params: [],
                body: {
                    type: 'BlockStatement',
                    body: [{
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'CallExpression',
                            callee: { type: 'Identifier', name: 'functionA' },
                            arguments: []
                        }
                    }]
                },
                'fan-in': { functionB: 1 },
                'fan-out': { functionA: 1 }
            }
        });
    });

    it('should compute the correct metric structure for TS file', function() {
        expect(metricsResults['function-coupling']['result'][tsFile]).toEqual({
            functionA: {
                type: 'FunctionDeclaration',
                id: { type: 'Identifier', name: 'functionA' },
                generator: false,
                async: false,
                params: [],
                returnType: { type: 'TSTypeAnnotation', typeAnnotation: { type: 'TSVoidKeyword' } },
                body: {
                    type: 'BlockStatement',
                    body: [{
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'CallExpression',
                            callee: { type: 'Identifier', name: 'functionB' },
                            arguments: []
                        }
                    }]
                },
                'fan-out': { functionB: 1 },
                'fan-in': { functionC: 1 }
            },
            functionB: {
                type: 'FunctionExpression',
                id: null,
                generator: false,
                async: false,
                params: [],
                returnType: { type: 'TSTypeAnnotation', typeAnnotation: { type: 'TSVoidKeyword' } },
                body: {
                    type: 'BlockStatement',
                    body: [{
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'CallExpression',
                            callee: { type: 'Identifier', name: 'functionC' },
                            arguments: []
                        }
                    }]
                },
                'fan-in': { functionA: 1 },
                'fan-out': { functionC: 1 }
            },
            functionC: {
                type: 'ArrowFunctionExpression',
                returnType: { type: 'TSTypeAnnotation', typeAnnotation: { type: 'TSVoidKeyword' } },
                id: null,
                generator: false,
                async: false,
                params: [],
                body: {
                    type: 'BlockStatement',
                    body: [{
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'CallExpression',
                            callee: { type: 'Identifier', name: 'functionA' },
                            arguments: []
                        }
                    }]
                },
                'fan-in': { functionB: 1 },
                'fan-out': { functionA: 1 }
            }
        });
    });
});