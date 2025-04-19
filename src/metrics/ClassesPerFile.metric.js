const state = {
    metricName: "Classes Per File",
    description: "Analyzes class distribution without duplicate entries",
    result: {
        files: {},
        statistics: {
            totalClasses: 0,
            anonymousClasses: 0,
            exportedClasses: 0,
            averageClassesPerFile: 0
        }
    },
    id: '2',
    dependencies: [],
    currentFile: null
};

const visitors = [
    {
        Program(path, state) {
            state.currentFile = path.parent.loc?.filePath || null;
            if (state.currentFile) initFileEntry(state);
        },

        ClassDeclaration(path) {
            processClass(path, 'declaration', state);
        },

        ClassExpression(path) {
            processClass(path, 'expression', state);
        }
    }
];

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

function checkExported(path) {
    return Boolean(path.findParent(p =>
        p.isExportNamedDeclaration() ||
        p.isExportDefaultDeclaration()
    ));
}

function checkDefaultExport(path) {
    return Boolean(path.findParent(p =>
        p.isExportDefaultDeclaration()
    ));
}

const postProcessing = (state) => {
    const fileCount = Object.keys(state.result.files).length;
    state.result.statistics.averageClassesPerFile = fileCount > 0
        ? Number((state.result.statistics.totalClasses / fileCount).toFixed(2))
        : 0;

    delete state.currentFile;
};

export { state, visitors, postProcessing };
