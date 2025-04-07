const state = {
    metricName: "Class Coupling Analysis",
    description: "Calculates fan-in and fan-out dependencies between classes",
    version: "1.0",
    result: [],
    classesMap: {},
    currentFilePath: null,
    classCallee: {}
};

const visitors = [
    {
        /* Example:
        state.currentFilePath: "/home/src/garage.js"

        This code register the every file in result to store the analysis.
        */
        Program(path) {
            state.currentFilePath = path.parent.loc?.filePath || 'unknown';
        },

        /* Example for the following visitors, ClassDeclaration and ClassExpression:
        state.result:
        [
            {
                name: 'Car',
                filePath: state.currentFilePath,
                fanIn: [],
                fanOut: []
            }
        ]

        This code register every class detected on each file (e.g. Car)
        */
        ClassDeclaration(path) {
            const className = getClassName(path);
            if (className && state.currentFilePath) {
                const class_ = {
                    name: className,
                    filePath: state.currentFilePath,
                    fanIn: [],
                    fanOut: []
                }
                state.result.push(class_);
            }
        },
        ClassExpression(path) {
            const className = getClassName(path);
            if (className && state.currentFilePath) {
                const class_ = {
                    name: className,
                    filePath: state.currentFilePath,
                    fanIn: [],
                    fanOut: []
                }
                state.result.push(class_);
            }
        }
    },
    {
        Program(path) {
            state.currentFile = path.parent.loc?.filePath || 'unknown';
        },

        ClassBody(path) {
            const parent = path.findParent(p =>
                p.isClassDeclaration ||
                p.isClassExpression()
            );

            const caller = getClassName(parent)

            const handler = {
                /* Example:
                this.parkedCar = new Car();

                For that code this will store { parkedCar: 'Car' } for future reference.

                Every call on parkedCar will be a call to class 'Car'
                */
                AssignmentExpression(path){
                    const { node } = path;
                    if (node.left.type === 'MemberExpression' && node.right.type === 'NewExpression'){
                        const callee = node.right.callee;
                        if (callee.type === 'Identifier') {
                            const calleeName = callee.name;
                            const propertyName = node.left.property.name;

                            // For reference
                            state.classCallee[propertyName] = calleeName;

                            updateFanOut(state.result, caller, calleeName);
                            updateFanIn(state.result, calleeName, caller);
                        }
                    }
                },

                /* Example:
                const myCar = new Car();

                For that code this will store { myCar: 'Car' } for future reference.

                Every call on myCar is a call to class 'Car'
                */
                VariableDeclarator(path) {
                    const { node } = path;
                    if (node.id.type === 'Identifier' && node.init.type === 'NewExpression') {
                        const instanceName = node.id.name;
                        const calleeName = node.init.callee.name;

                        // For reference
                        state.classCallee[instanceName] = calleeName;

                        updateFanOut(state.result, caller, calleeName);
                        updateFanIn(state.result, calleeName, caller);
                    }
                }
            }

            path.traverse(handler, state)
        }
    },
    {
        Program(path) {
            state.currentFile = path.parent.loc?.filePath || 'unknown';
        },

        ClassBody(path) {
            const parent = path.findParent(p =>
                p.isClassDeclaration ||
                p.isClassExpression()
            );

            const caller = getClassName(parent)

            const handler = {
                /*
                TODO: add example
                */
                CallExpression(path) {
                    const { node } = path;

                    if (node.callee.type === 'MemberExpression' &&
                        node.callee.object.type === 'MemberExpression' &&
                        node.callee.object.object.type === 'ThisExpression')
                    {
                        const propertyName = node.callee.object.property.name;
                        const calleeName = state.classCallee[propertyName]

                        updateFanOut(state.result, caller, calleeName);
                        updateFanIn(state.result, calleeName, caller);
                    }
                }
            }

            path.traverse(handler, state)
        }
    }
];

function updateFanOut(classArray, callerName, calleeName) {
    const callerClass = classArray.find(c => c.name === callerName);
    if (callerClass) {
        callerClass.fanOut.push(calleeName);
    }
}

function updateFanIn(classArray, calleeName, callerName) {
    const calleeClass = classArray.find(c => c.name === calleeName);
    if (calleeClass) {
        calleeClass.fanIn.push(callerName);
    }
}

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
    delete state.classesMap;
    delete state.currentFilePath;
    delete state.classCallee;
};

export { state, visitors, postProcessing };