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

        expect(functionCoupling).toHaveProperty('name', 'Functions Coupling');
        expect(functionCoupling).toHaveProperty('description');
        expect(functionCoupling.description).toContain('Collects all function declarations');
    });

    it('should compute the correct metric structure for JS file', function() {
        const functionCoupling = metricsResults['function-coupling'];
        const jsFile = path.resolve(__dirname, '../src-examples/function-coupling/JS/functions-coupled.js');
        expect(functionCoupling).toHaveProperty('result');
        const result = functionCoupling.result;
        expect(jsFile).toBeDefined();
        expect(result[jsFile]).toBeDefined();
        expect(result[jsFile]).toEqual({
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
        const functionCoupling = metricsResults['function-coupling'];
        const tsFile = path.resolve(__dirname, '../src-examples/function-coupling/TS/funtions-coupled.ts');
        expect(functionCoupling).toHaveProperty('result');
        const result = functionCoupling.result;
        expect(tsFile).toBeDefined();
        expect(result[tsFile]).toBeDefined();
        expect(result[tsFile]).toEqual({
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

    it('should return status = true', function() {
        const functionCoupling = metricsResults['function-coupling'];
        expect(functionCoupling).toHaveProperty('status', true);
    });
});