import generate from "@babel/generator";

const state = {
    metricName: "Method Analysis",
    description: "Collect class/object methods",
    result: {
        files: {},
        statistics: {
            totalMethods: 0,
            classMethods: 0,
            objectMethods: 0,
            asyncCount: 0,
            generatorCount: 0
        }
    },
    currentFile: null,
    id: '5',
    dependencies: [],
};

const visitors = [
    {
        Program(path) {
            state.currentFile = path.parent.loc.filePath;
            initFileEntry();
        },

        // Class Methods
        ClassMethod(path) {
            handleMethod(path, 'class');
        },

        // Object Methods
        ObjectMethod(path) {
            handleMethod(path, 'object');
        },

        ClassProperty(path) {
            const isFunction = [
                'FunctionExpression',
                'ArrowFunctionExpression'
            ].includes(path.node.value?.type);

            if (isFunction) {
                handleClassFieldMethod(path);
            }
        },

        ObjectProperty(path) {
            if (isFunctionValue(path.node.value)) {
                handleObjectMethod(path);
            }
        }
    }
];

// Helpers
function initFileEntry() {
    if (!state.result.files[state.currentFile]) {

        state.result.files[state.currentFile] = {
            'classes - objects': {}
        };
    }
}

function addMethodToFileGroup(metadata) {
    const parentName = metadata.parent;
    const fileEntry = state.result.files[state.currentFile];
    if (!fileEntry.classes[parentName]) {
        fileEntry.classes[parentName] = [];
    }

    delete metadata["loc"];

    fileEntry.classes[parentName].push(metadata);
}

function handleMethod(path, contextType) {
    const parent = getParentContext(path);
    const metadata = {
        ...baseMetadata(path, 'method'),
        context: contextType,
        parent: parent.name,
        isStatic: parent.isStatic,
        signature: generateMethodSignature(path, parent)
    };

    addMethodToFileGroup(metadata);
    updateStatistics({ type: 'method', metadata, contextType });
}

function baseMetadata(path, category) {
    const node = path.node;
    return {
        name: getIdentifier(path, category),
        params: extractParams(node.params),
        isAsync: node.async,
        isGenerator: node.generator,
        loc: node.loc ? {
            start: node.loc.start,
            end: node.loc.end
        } : null
    };
}

function getIdentifier(path, category) {
    if (category === 'method') return path.node.key.name;
    return path.node.id?.name ||
        path.parent?.id?.name ||
        '{anonymous}';
}

function extractParams(params) {
    return params.map(param => ({
        name: param.name,
        type: param.typeAnnotation ?
            generate.default(param.typeAnnotation.typeAnnotation).code :
            null,
        hasDefault: param.type === 'AssignmentPattern'
    }));
}

function generateMethodSignature(path, parent) {
    const { isAsync, isGenerator, name } = baseMetadata(path, 'method');
    return [
        parent.isStatic && 'static',
        isAsync && 'async',
        isGenerator && '*',
        `${parent.name}.${name}`,
        `(${extractParams(path.node.params).map(p => p.name).join(', ')})`
    ].filter(Boolean).join(' ');
}

function getParentContext(path) {
    const classParent = path.findParent(p => p.isClassDeclaration());
    if (classParent) {
        const className = classParent.node.id ? classParent.node.id.name : '{anonymous}';
        const memberParent = path.findParent(p => p.isClassMethod() || p.isClassProperty());
        const isStatic = memberParent ? memberParent.node.static : false;

        return {
            type: 'class',
            name: className,
            isStatic: isStatic
        };
    }

    const objectParent = path.findParent(p => p.isObjectExpression());
    if (objectParent) {
        const varParent = objectParent.findParent(p => p.isVariableDeclarator());
        return {
            type: 'object',
            name: varParent?.node.id?.name || '{anonymous}',
            isStatic: false
        };
    }

    return { name: 'unknown', isStatic: false };
}

function handleClassFieldMethod(path) {
    const classParent = path.findParent(p => p.isClassDeclaration());
    if (!classParent) return;

    const methodNode = path.node;
    const functionNode = methodNode.value;

    const metadata = {
        name: getClassFieldName(methodNode),
        context: 'class',
        parent: classParent.node.id.name,
        isStatic: path.parent.static,
        isAsync: functionNode.async,
        isGenerator: functionNode.generator,
        params: extractParams(functionNode.params),
        signature: generateClassFieldSignature(path, classParent),
        loc: methodNode.loc,
        type: methodNode.value.type === 'ArrowFunctionExpression' ? 'arrow' : 'function'
    };

    addMethodToFileGroup(metadata);
    updateStatistics({
        type: 'method',
        metadata,
        contextType: 'class'
    });
}

function getClassFieldName(node) {
    if (node.key.type === 'Identifier') return node.key.name;
    if (node.key.type === 'StringLiteral') return node.key.value;
    return '{computed-name}';
}

function generateClassFieldSignature(path, classParent) {
    const methodNode = path.node;
    const functionNode = methodNode.value;
    const parts = [];

    if (path.parent.static) parts.push('static');
    if (functionNode.async) parts.push('async');
    if (functionNode.generator) parts.push('function*');

    parts.push(`${classParent.node.id.name}.${getClassFieldName(methodNode)}`);

    const params = functionNode.params.map(p => p.name).join(', ');
    return `${parts.filter(Boolean).join(' ')}(${params})`;
}

function handleObjectMethod(path) {
    const objectParent = path.findParent(p => p.isObjectExpression());
    if (!objectParent) return;

    const methodNode = path.node;
    const functionNode = methodNode.value;

    const metadata = {
        name: getObjectMethodName(methodNode),
        context: 'object',
        parent: getObjectName(objectParent),
        isStatic: false,
        isAsync: functionNode.async,
        isGenerator: functionNode.generator,
        params: extractParams(functionNode.params),
        signature: generateObjectMethodSignature(objectParent, methodNode),
        loc: methodNode.loc,
        type: 'function'
    };

    addMethodToFileGroup(metadata);
    updateStatistics({
        type: 'method',
        metadata,
        contextType: 'object'
    });
}

function isFunctionValue(node) {
    return node && [
        'FunctionExpression',
        'ArrowFunctionExpression'
    ].includes(node.type);
}

function getObjectMethodName(node) {
    if (node.key.type === 'Identifier') return node.key.name;
    if (node.key.type === 'StringLiteral') return node.key.value;
    return '{computed-method}';
}

function getObjectName(objectParent) {
    const varDeclarator = objectParent.findParent(p => p.isVariableDeclarator());
    return varDeclarator?.node.id?.name || '{anonymous-object}';
}

function generateObjectMethodSignature(objectParent, methodNode) {
    const objectName = getObjectName(objectParent);
    const params = methodNode.value.params.map(p => p.name).join(', ');
    return `${objectName}.${getObjectMethodName(methodNode)}(${params})`;
}

function updateStatistics({ type, metadata, contextType }) {
    if (type === 'function') {
        state.result.statistics.totalFunctions++;
    } else {
        state.result.statistics.totalMethods++;
        contextType === 'class'
            ? state.result.statistics.classMethods++
            : state.result.statistics.objectMethods++;
    }

    if (metadata.isAsync) state.result.statistics.asyncCount++;
    if (metadata.isGenerator) state.result.statistics.generatorCount++;
}

const postProcessing = (state) => {
    delete state.currentFile;
};

export { state, visitors, postProcessing };
