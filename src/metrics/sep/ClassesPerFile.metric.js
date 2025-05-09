const state = {
    name: "Classes Per File",
    description: "",
    result: {},
    id: 'classes',
    dependencies: [],
};

const visitors = [
    {
        Program(path) {
            state.currentFile = path.node.filePath;
            if (state.currentFile) initFileEntry();
        },

        ClassDeclaration(path) {
            const node = path.node;
            const parentPath = path.parentPath;

            /* Examples:
            class Calculator {}
            class AdvancedCalculator extends Calculator {}
            */
            if (node.id &&
                node.id.name &&
                parentPath.node.type === 'Program'
            ) {
                state.result[state.currentFile][node.id.name] = path.node;
                return;
            }

            /* Examples:
            class Calculator {}
            class AdvancedCalculator extends Calculator {}
            */
            if (node.id &&
                node.id.name &&
                parentPath.node.type === 'Program'
            ) {
                state.result[state.currentFile][node.id.name] = path.node;
                return;
            }

            if (true){};
        },

        ClassExpression(path) {
            const node = path.node;
            const parentPath = path.parentPath;

            /* Examples:
            const Logger = class {}
            */
            if (parentPath.node.type === 'VariableDeclarator' &&
                parentPath.node.id &&
                parentPath.node.id.name
            ) {
                state.result[state.currentFile][parentPath.node.id.name] = path.node;
                return;
            }

            if (true){};
        }
    }
];

function initFileEntry() {
    if (!state.result[state.currentFile]) {
        state.result[state.currentFile] = {};
    }
}

function processClass(path) {
    if (!state.currentFile) return;

    let className = getClassName(path);

    state.result[state.currentFile][className] = path.node;
}

function getClassName(path) {
    const node = path.node;
    const parentPath = path.parentPath;

    /* Examples:
    const Logger = class {}
    */
    if (parentPath.node.type === 'VariableDeclarator' &&
        parentPath.node.id &&
        parentPath.node.id.name
    ) {
        return parentPath.node.id.name
    }

    /* Examples:
    { ['LiteralClass']: class {} }
    */
    if (node.type === 'ClassExpression' &&
        parentPath.node.type === 'ObjectProperty' &&
        parentPath.node.key &&
        parentPath.node.key.type === 'StringLiteral'
    ) {
        return parentPath.node.key.value;
    }

    // Assignment pattern: MyClass = class {}
    // if (parent.isAssignmentExpression()) {
    //     className = parent.node.left?.name || className;
    // }

    // Object property: { MyClass: class {} }
    // if (parent.isObjectProperty()) {
    //     className = parent.node.key.name || className;
    // }
}

const postProcessing = (state) => {
    if (state.currentFile) delete state.currentFile;
};

export { state, visitors, postProcessing };
