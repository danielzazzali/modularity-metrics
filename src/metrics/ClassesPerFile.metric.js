/**
 * Classes Per File Metric Module
 *
 * Tracks class distribution across files with enhanced anonymous class handling
 * @module ClassesPerFile
 */

const state = {
    metricName: "Classes Per File",
    description: "Analyzes class distribution without duplicate entries",
    result: {
        /**
         * @typedef {Object} FileAnalysis
         * @property {Array<ClassEntry>} classes - Class entries in file
         * @property {number} total - Total class count
         * @property {number} exported - Exported classes count
         * @property {number} anonymous - Anonymous classes count
         */
        files: {},  // { [filePath]: FileAnalysis }

        statistics: {
            totalClasses: 0,
            anonymousClasses: 0,
            exportedClasses: 0,
            averageClassesPerFile: 0
        }
    },
    currentFile: null
};

/**
 * AST visitors for class detection
 * @type {Array<Object>}
 */
const visitors = [
    {
        /**
         * Initializes file context on program entry
         * @param {Object} path - AST path
         * @param {Object} state - Metric state
         */
        Program(path, state) {
            state.currentFile = path.parent.loc?.filePath || null;
            if (state.currentFile) initFileEntry(state);
        },

        /**
         * Processes class declarations
         * @param {Object} path - ClassDeclaration AST path
         */
        ClassDeclaration(path) {
            processClass(path, 'declaration', state);
        },

        /**
         * Processes class expressions
         * @param {Object} path - ClassExpression AST path
         */
        ClassExpression(path) {
            processClass(path, 'expression', state);
        }
    }
];

// Core Processing Functions

/**
 * Initializes file entry in results
 * @param {Object} state - Metric state
 */
function initFileEntry(state) {
    if (!state.result.files[state.currentFile]) {
        state.result.files[state.currentFile] = {
            classes: [],
            total: 0,
            exported: 0,
            anonymous: 0
        };
    }
}

/**
 * Main class processing handler
 * @param {Object} path - AST path
 * @param {'declaration'|'expression'} type - Class type
 * @param {Object} state - Metric state
 */
function processClass(path, type, state) {
    if (!state.currentFile) return;

    const classData = buildClassData(path, type, state.currentFile);
    const file = state.result.files[state.currentFile];

    file.classes.push(classData);
    file.total++;
    if (classData.isAnonymous) file.anonymous++;
    if (classData.isExported) file.exported++;

    state.result.statistics.totalClasses++;
    if (classData.isAnonymous) state.result.statistics.anonymousClasses++;
    if (classData.isExported) state.result.statistics.exportedClasses++;
}

/**
 * Builds class metadata object
 * @param {Object} path - AST path
 * @param {string} type - Class type
 * @param {string} filePath - Source file path
 * @returns {ClassEntry}
 */
function buildClassData(path, type, filePath) {
    const node = path.node;

    return {
        name: getClassName(node, path),
        type,
        loc: node.loc ? {
            start: { line: node.loc.start.line, column: node.loc.start.column },
            end: { line: node.loc.end.line, column: node.loc.end.column }
        } : null,
        isExported: checkExported(path),
        isAnonymous: !node.id,
        isDefaultExport: checkDefaultExport(path),
        file: filePath,
        parentType: path.parentPath?.type || 'Unknown'
    };
}

/**
 * Resolves class name from AST context
 * @param {Object} node - Class node
 * @param {Object} path - AST path
 * @returns {string}
 */
function getClassName(node, path) {
    // Named class detection
    if (node.id) return node.id.name;

    const parent = path.parentPath;

    // Variable declaration: const MyClass = class {}
    if (parent.isVariableDeclarator()) {
        return parent.node.id?.name || '{AnonymousClass}';
    }

    // Assignment pattern: MyClass = class {}
    if (parent.isAssignmentExpression()) {
        return parent.node.left?.name || '{AnonymousClass}';
    }

    // Object property: { MyClass: class {} }
    if (parent.isObjectProperty()) {
        return parent.node.key.name || '{AnonymousClass}';
    }

    // Default export detection
    if (checkDefaultExport(path)) {
        return 'default';
    }

    // Fallback for anonymous classes
    return '{AnonymousClass}';
}

/**
 * Checks export status of class
 * @param {Object} path - AST path
 * @returns {boolean}
 */
function checkExported(path) {
    return Boolean(path.findParent(p =>
        p.isExportNamedDeclaration() ||
        p.isExportDefaultDeclaration()
    ));
}

/**
 * Checks default export status
 * @param {Object} path - AST path
 * @returns {boolean}
 */
function checkDefaultExport(path) {
    return Boolean(path.findParent(p =>
        p.isExportDefaultDeclaration()
    ));
}

/**
 * Final processing for statistical calculations
 * @param {Object} state - Metric state
 */
const postProcessing = (state) => {
    const fileCount = Object.keys(state.result.files).length;
    state.result.statistics.averageClassesPerFile = fileCount > 0
        ? Number((state.result.statistics.totalClasses / fileCount).toFixed(2))
        : 0;

    delete state.currentFile;
};

export { state, visitors, postProcessing };
