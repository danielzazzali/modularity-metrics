const state = {
    metricName: "Class Coupling Analysis",
    description: "Calculates fan-in and fan-out dependencies between classes",
    version: "1.0",
    result: {},
    classesMap: {},
    currentFile: null
};

const visitors = [
    {
        Program(path, state) {
            state.currentFile = path.parent.loc?.filePath || 'unknown';

            if (!state.result[state.currentFile]) {
                state.result[state.currentFile] = {
                    classes: {}
                };
            }
        },

        ClassDeclaration(path, state) {
            const className = getClassName(path);
            if (className && state.currentFile) {
                state.result[state.currentFile].classes[className] = {
                    fanIn: [],
                    fanOut: [],
                };

                state.classesMap[className] = state.currentFile;
            }
        },

        ClassExpression(path, state) {
            const className = getClassName(path);
            if (className && state.currentFile) {
                state.result[state.currentFile].classes[className] = {
                    fanIn: [],
                    fanOut: [],
                };

                state.classesMap[className] = state.currentFile;
            }
        }
    },
    {
        Program(path, state) {
            state.currentFile = path.parent.loc?.filePath || 'unknown';
        },

        ClassBody(path, state) {
            const parent = path.findParent(p =>
                p.isClassDeclaration ||
                p.isClassExpression()
            );

            const caller = getClassName(parent)

            const handler = {
                NewExpression(node) {
                    const callee = node.node.callee.name;
                    state.result[state.currentFile].classes[caller].fanOut.push(callee);

                    Object.keys(state.result).forEach(file => {
                        Object.keys(state.result[file].classes).forEach(className => {
                            if (className === callee){
                                state.result[file].classes[callee].fanIn.push(caller);
                            }
                        });
                    });
                }
            }

            path.traverse(handler)
        },
    }
];


function addFanIn(data, caller, callee) {
    Object.values(data).forEach(file => {
        if (file.classes && file.classes[callee]) {
            file.classes[callee].fanIn.push(caller);
        }
    });
}

/**
 * Resolves class name from AST context
 * @param {Object} path - AST path
 * @returns {string}
 */
function getClassName(path) {
    // Named class detection
    if (path.node.id) return path.node.id.name;

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

function checkDefaultExport(path) {
    return Boolean(path.findParent(p =>
        p.isExportDefaultDeclaration()
    ));
}

const postProcessing = (state) => {
    delete state.currentFile;
};

export { state, visitors, postProcessing };