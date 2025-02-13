/**
 * Import/Export Coupling Metric Module
 *
 * Tracks file dependencies through imports/exports relationships across ES modules,
 * CommonJS, and TypeScript-specific syntax.
 * @module ImportExportCoupling
 */

import path from 'path';
import fs from 'fs';

const state = {
    metricName: "Import/Export Coupling",
    description: "Analyzes module dependencies across ES, CommonJS, and TypeScript",
    result: {
        /**
         * @typedef {Object} FileCoupling
         * @property {string[]} imports - Absolute paths of directly imported files
         * @property {string[]} exports - Files that explicitly import this file
         */
        files: {},

        /**
         * @typedef {Object} UnresolvedImports
         * @property {string[]} paths - Unresolved relative paths with original formatting
         */
        unresolved: {}
    },
    currentFile: null,
    currentDir: null
};

/**
 * AST visitors for comprehensive dependency analysis
 * @type {Array<Object>}
 */
const visitors = [
    {
        /**
         * Initializes file context tracking
         * @param {Object} pathNode - AST program node
         * @param {Object} state - Metric state
         */
        Program(pathNode, state) {
            state.currentFile = pathNode.parent.loc?.filePath;
            state.currentDir = path.dirname(state.currentFile);

            if (!state.result.files[state.currentFile]) {
                state.result.files[state.currentFile] = {
                    imports: [],
                    exports: []
                };
            }
        },

        /**
         * Handles ES6 import statements
         * @example import { foo } from './bar'
         */
        ImportDeclaration(pathNode, state) {
            processDependency(pathNode.node.source.value, state);
        },

        /**
         * Handles CommonJS require calls
         * @example const foo = require('./bar')
         */
        CallExpression(pathNode, state) {
            if (pathNode.node.callee.name === 'require' &&
                pathNode.node.arguments.length > 0 &&
                pathNode.node.arguments[0].type === 'StringLiteral') {
                processDependency(pathNode.node.arguments[0].value, state);
            }
        },

        /**
         * Handles TypeScript-specific import equals declarations
         * @example import foo = require('./bar')
         */
        TSImportEqualsDeclaration(pathNode, state) {
            if (pathNode.node.moduleReference.type === 'TSExternalModuleReference') {
                const importPath = pathNode.node.moduleReference.expression.value;
                processDependency(importPath, state);
            }
        }
    }
];

/**
 * Processes dependency path resolution and registration
 * @param {string} importPath - Raw import specifier from code
 * @param {Object} state - Current metric state
 */
function processDependency(importPath, state) {
    try {
        const resolved = resolveImportPath(importPath, state.currentDir);

        resolved.exists ?
            registerDependency(state.currentFile, resolved.absolute, state) :
            trackUnresolved(state.currentFile, resolved.relative, state);
    } catch (error) {
        console.warn(`Dependency processing error: ${importPath}`, error);
    }
}

/**
 * Resolves import paths with TypeScript/JavaScript extension handling
 * @param {string} importPath - Relative/absolute import specifier
 * @param {string} baseDir - Base directory for resolution
 * @returns {Object} Resolution result with existence check
 */
function resolveImportPath(importPath, baseDir) {
    // Preserve original relative format for reporting
    const originalRelative = importPath.startsWith('.') ?
        importPath :
        `./${importPath}`;

    const absolutePath = path.resolve(baseDir, importPath);
    const extensions = ['', '.ts', '.js', '.tsx', '.jsx'];

    // Check existence with different extensions
    for (const ext of extensions) {
        const testPath = `${absolutePath}${ext}`;
        if (fs.existsSync(testPath)) {
            return {
                exists: true,
                absolute: testPath,
                relative: path.relative(baseDir, testPath)
            };
        }
    }

    return {
        exists: false,
        absolute: absolutePath,
        relative: originalRelative
    };
}

/**
 * Registers bidirectional dependency relationships
 * @param {string} source - Importing file path
 * @param {string} target - Imported file path
 * @param {Object} state - Metric state
 */
function registerDependency(source, target, state) {
    // Add to source's imports
    if (!state.result.files[source].imports.includes(target)) {
        state.result.files[source].imports.push(target);
    }

    // Initialize target if missing
    if (!state.result.files[target]) {
        state.result.files[target] = { imports: [], exports: [] };
    }

    // Add to target's exports
    if (!state.result.files[target].exports.includes(source)) {
        state.result.files[target].exports.push(source);
    }
}

/**
 * Tracks unresolved imports maintaining original relative format
 * @param {string} source - Importing file path
 * @param {string} unresolvedPath - Original unresolved specifier
 * @param {Object} state - Metric state
 */
function trackUnresolved(source, unresolvedPath, state) {
    if (!state.result.unresolved[source]) {
        state.result.unresolved[source] = [];
    }

    if (!state.result.unresolved[source].includes(unresolvedPath)) {
        state.result.unresolved[source].push(unresolvedPath);
    }
}

/**
 * Post-analysis cleanup
 * @param {Object} state - Metric state
 */
const postProcessing = (state) => {
    delete state.currentFile;
    delete state.currentDir;
};

export { state, visitors, postProcessing };
