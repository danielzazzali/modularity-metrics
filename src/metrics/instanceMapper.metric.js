const state = {
    name: 'Instance Mapper',
    description: 'Walks through each class method to identify instance accesses (this.prop and local variables) and map them to their constructor types',
    result: {},
    id: 'instance-mapper',
    dependencies: ['files'],
    ignore: true,
    status: false
};

const visitors = {
    // Entry point for each parsed file, load dependency
    Program(path) {
        state.currentFile = path.node.filePath;
        state.result[state.currentFile] = state.dependencies['files'][state.currentFile];
    },

    ClassDeclaration(path) {
        const node = path.node;
        const parentPath = path.parentPath;

        /* Examples:
           class Calculator {}
           class AdvancedCalculator extends Calculator {}

           parentPath.node.type === 'Program' -> Consider only file block class declarations
           Ignore: (() => { <Class_declaration_here> })();
        */
        if (node.id &&
            node.id.name &&
            parentPath.node.type === 'Program'
        ) {
            /* Ignore:
               class SuperCalculator extends class {}
            */
            if (node.superClass &&
                node.superClass.type === 'ClassExpression'
            ) {
                return;
            }

            const className = node.id.name
            state.result[state.currentFile][className] = {};

            path.traverse({
                ClassMethod(innerPath) {
                    innerPath.traverse({
                        NewExpression(deepPath) {
                            if (deepPath.node.callee.type === 'Identifier' &&
                                deepPath.parentPath.node.type === 'AssignmentExpression' &&
                                deepPath.parentPath.node.left.type === 'MemberExpression' &&
                                deepPath.parentPath.node.left.object.type === 'ThisExpression' &&
                                deepPath.parentPath.node.left.property.type === 'Identifier'
                            ) {
                                state.result[state.currentFile][className][`this.${deepPath.parentPath.node.left.property.name}`] = deepPath.node.callee.name;
                            }

                            if (deepPath.node.callee.type === 'Identifier' &&
                                deepPath.parentPath.node.type === 'VariableDeclarator' &&
                                deepPath.parentPath.node.id.type === 'Identifier'
                            ) {
                                state.result[state.currentFile][className][deepPath.parentPath.node.id.name] = deepPath.node.callee.name;
                            }
                        }
                    })
                },
                ClassProperty(innerPath) {
                    if (innerPath.node.value.type === 'ArrowFunctionExpression' ||
                        innerPath.node.value.type === 'FunctionExpression'
                    ) {
                        innerPath.traverse({
                            NewExpression(deepPath) {
                                if (deepPath.node.callee.type === 'Identifier' &&
                                    deepPath.parentPath.node.type === 'AssignmentExpression' &&
                                    deepPath.parentPath.node.left.type === 'MemberExpression' &&
                                    deepPath.parentPath.node.left.object.type === 'ThisExpression' &&
                                    deepPath.parentPath.node.left.property.type === 'Identifier'
                                ) {
                                    state.result[state.currentFile][className][`this.${deepPath.parentPath.node.left.property.name}`] = deepPath.node.callee.name;
                                }

                                if (deepPath.node.callee.type === 'Identifier' &&
                                    deepPath.parentPath.node.type === 'VariableDeclarator' &&
                                    deepPath.parentPath.node.id.type === 'Identifier'
                                ) {
                                    state.result[state.currentFile][className][deepPath.parentPath.node.id.name] = deepPath.node.callee.name;
                                }
                            }
                        })
                    }
                }
            })

            return;
        }

        /* Examples:
           export default class {}
           export default class Foo{}
        */
        if (parentPath.node.type === 'ExportDefaultDeclaration') {
            // Classes with default export will be referenced by the name of the file
            const className = path.node.id
                ? path.node.id.name
                : state.currentFile
                    .split('/')
                    .pop()
                    .replace(/\.(js|ts)$/, '');

            state.result[state.currentFile][className] = [];

            path.traverse({
                ClassMethod(innerPath) {
                    innerPath.traverse({
                        NewExpression(deepPath) {
                            if (deepPath.node.callee.type === 'Identifier' &&
                                deepPath.parentPath.node.type === 'AssignmentExpression' &&
                                deepPath.parentPath.node.left.type === 'MemberExpression' &&
                                deepPath.parentPath.node.left.object.type === 'ThisExpression' &&
                                deepPath.parentPath.node.left.property.type === 'Identifier'
                            ) {
                                state.result[state.currentFile][className][`this.${deepPath.parentPath.node.left.property.name}`] = deepPath.node.callee.name;
                            }

                            if (deepPath.node.callee.type === 'Identifier' &&
                                deepPath.parentPath.node.type === 'VariableDeclarator' &&
                                deepPath.parentPath.node.id.type === 'Identifier'
                            ) {
                                state.result[state.currentFile][className][deepPath.parentPath.node.id.name] = deepPath.node.callee.name;
                            }
                        }
                    })
                },
                ClassProperty(innerPath) {
                    if (innerPath.node.value.type === 'ArrowFunctionExpression' ||
                        innerPath.node.value.type === 'FunctionExpression'
                    ) {
                        innerPath.traverse({
                            NewExpression(deepPath) {
                                if (deepPath.node.callee.type === 'Identifier' &&
                                    deepPath.parentPath.node.type === 'AssignmentExpression' &&
                                    deepPath.parentPath.node.left.type === 'MemberExpression' &&
                                    deepPath.parentPath.node.left.object.type === 'ThisExpression' &&
                                    deepPath.parentPath.node.left.property.type === 'Identifier'
                                ) {
                                    state.result[state.currentFile][className][`this.${deepPath.parentPath.node.left.property.name}`] = deepPath.node.callee.name;
                                }

                                if (deepPath.node.callee.type === 'Identifier' &&
                                    deepPath.parentPath.node.type === 'VariableDeclarator' &&
                                    deepPath.parentPath.node.id.type === 'Identifier'
                                ) {
                                    state.result[state.currentFile][className][deepPath.parentPath.node.id.name] = deepPath.node.callee.name;
                                }
                            }
                        })
                    }
                }
            })
        }
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

            /* Ignore:
               (() => { <Class_expression_here> })();
            */
            if (parentPath.find(p => p.isCallExpression())) {
                return;
            }

            /* Ignore:
               class SuperCalculator extends class {}
            */
            if (node.superClass &&
                node.superClass.type === 'ClassExpression'
            ) {
                return;
            }

            const className = parentPath.node.id.name;
            state.result[state.currentFile][className] = [];

            path.traverse({
                ClassMethod(innerPath) {
                    innerPath.traverse({
                        NewExpression(deepPath) {
                            if (deepPath.node.callee.type === 'Identifier' &&
                                deepPath.parentPath.node.type === 'AssignmentExpression' &&
                                deepPath.parentPath.node.left.type === 'MemberExpression' &&
                                deepPath.parentPath.node.left.object.type === 'ThisExpression' &&
                                deepPath.parentPath.node.left.property.type === 'Identifier'
                            ) {
                                state.result[state.currentFile][className][`this.${deepPath.parentPath.node.left.property.name}`] = deepPath.node.callee.name;
                            }

                            if (deepPath.node.callee.type === 'Identifier' &&
                                deepPath.parentPath.node.type === 'VariableDeclarator' &&
                                deepPath.parentPath.node.id.type === 'Identifier'
                            ) {
                                state.result[state.currentFile][className][deepPath.parentPath.node.id.name] = deepPath.node.callee.name;
                            }
                        }
                    })
                },
                ClassProperty(innerPath) {
                    if (innerPath.node.value.type === 'ArrowFunctionExpression' ||
                        innerPath.node.value.type === 'FunctionExpression'
                    ) {
                        innerPath.traverse({
                            NewExpression(deepPath) {
                                if (deepPath.node.callee.type === 'Identifier' &&
                                    deepPath.parentPath.node.type === 'AssignmentExpression' &&
                                    deepPath.parentPath.node.left.type === 'MemberExpression' &&
                                    deepPath.parentPath.node.left.object.type === 'ThisExpression' &&
                                    deepPath.parentPath.node.left.property.type === 'Identifier'
                                ) {
                                    state.result[state.currentFile][className][`this.${deepPath.parentPath.node.left.property.name}`] = deepPath.node.callee.name;
                                }

                                if (deepPath.node.callee.type === 'Identifier' &&
                                    deepPath.parentPath.node.type === 'VariableDeclarator' &&
                                    deepPath.parentPath.node.id.type === 'Identifier'
                                ) {
                                    state.result[state.currentFile][className][deepPath.parentPath.node.id.name] = deepPath.node.callee.name;
                                }
                            }
                        })
                    }
                }
            })

            return;
        }

        /* Examples:
           { ['LiteralClassName']: class {} }
        */
        if (parentPath.node.type === 'ObjectProperty' &&
            parentPath.node.key &&
            parentPath.node.key.type === 'StringLiteral'
        ) {
            const className = parentPath.node.key.value;
            state.result[state.currentFile][className] = [];

            path.traverse({
                ClassMethod(innerPath) {
                    innerPath.traverse({
                        NewExpression(deepPath) {
                            if (deepPath.node.callee.type === 'Identifier' &&
                                deepPath.parentPath.node.type === 'AssignmentExpression' &&
                                deepPath.parentPath.node.left.type === 'MemberExpression' &&
                                deepPath.parentPath.node.left.object.type === 'ThisExpression' &&
                                deepPath.parentPath.node.left.property.type === 'Identifier'
                            ) {
                                state.result[state.currentFile][className][`this.${deepPath.parentPath.node.left.property.name}`] = deepPath.node.callee.name;
                            }

                            if (deepPath.node.callee.type === 'Identifier' &&
                                deepPath.parentPath.node.type === 'VariableDeclarator' &&
                                deepPath.parentPath.node.id.type === 'Identifier'
                            ) {
                                state.result[state.currentFile][className][deepPath.parentPath.node.id.name] = deepPath.node.callee.name;
                            }
                        }
                    })
                },
                ClassProperty(innerPath) {
                    if (innerPath.node.value.type === 'ArrowFunctionExpression' ||
                        innerPath.node.value.type === 'FunctionExpression'
                    ) {
                        innerPath.traverse({
                            NewExpression(deepPath) {
                                if (deepPath.node.callee.type === 'Identifier' &&
                                    deepPath.parentPath.node.type === 'AssignmentExpression' &&
                                    deepPath.parentPath.node.left.type === 'MemberExpression' &&
                                    deepPath.parentPath.node.left.object.type === 'ThisExpression' &&
                                    deepPath.parentPath.node.left.property.type === 'Identifier'
                                ) {
                                    state.result[state.currentFile][className][`this.${deepPath.parentPath.node.left.property.name}`] = deepPath.node.callee.name;
                                }

                                if (deepPath.node.callee.type === 'Identifier' &&
                                    deepPath.parentPath.node.type === 'VariableDeclarator' &&
                                    deepPath.parentPath.node.id.type === 'Identifier'
                                ) {
                                    state.result[state.currentFile][className][deepPath.parentPath.node.id.name] = deepPath.node.callee.name;
                                }
                            }
                        })
                    }
                }
            })

            return;
        }

        /* Examples:
           { Printer: class {} }
        */
        if (parentPath.node.type === 'ObjectProperty' &&
            parentPath.node.key &&
            parentPath.node.key.type === 'Identifier' &&
            parentPath.node.computed === false
        ) {
            const className = parentPath.node.key.name;
            state.result[state.currentFile][className] = [];

            path.traverse({
                ClassMethod(innerPath) {
                    innerPath.traverse({
                        NewExpression(deepPath) {
                            if (deepPath.node.callee.type === 'Identifier' &&
                                deepPath.parentPath.node.type === 'AssignmentExpression' &&
                                deepPath.parentPath.node.left.type === 'MemberExpression' &&
                                deepPath.parentPath.node.left.object.type === 'ThisExpression' &&
                                deepPath.parentPath.node.left.property.type === 'Identifier'
                            ) {
                                state.result[state.currentFile][className][`this.${deepPath.parentPath.node.left.property.name}`] = deepPath.node.callee.name;
                            }

                            if (deepPath.node.callee.type === 'Identifier' &&
                                deepPath.parentPath.node.type === 'VariableDeclarator' &&
                                deepPath.parentPath.node.id.type === 'Identifier'
                            ) {
                                state.result[state.currentFile][className][deepPath.parentPath.node.id.name] = deepPath.node.callee.name;
                            }
                        }
                    })
                },
                ClassProperty(innerPath) {
                    if (innerPath.node.value.type === 'ArrowFunctionExpression' ||
                        innerPath.node.value.type === 'FunctionExpression'
                    ) {
                        innerPath.traverse({
                            NewExpression(deepPath) {
                                if (deepPath.node.callee.type === 'Identifier' &&
                                    deepPath.parentPath.node.type === 'AssignmentExpression' &&
                                    deepPath.parentPath.node.left.type === 'MemberExpression' &&
                                    deepPath.parentPath.node.left.object.type === 'ThisExpression' &&
                                    deepPath.parentPath.node.left.property.type === 'Identifier'
                                ) {
                                    state.result[state.currentFile][className][`this.${deepPath.parentPath.node.left.property.name}`] = deepPath.node.callee.name;
                                }

                                if (deepPath.node.callee.type === 'Identifier' &&
                                    deepPath.parentPath.node.type === 'VariableDeclarator' &&
                                    deepPath.parentPath.node.id.type === 'Identifier'
                                ) {
                                    state.result[state.currentFile][className][deepPath.parentPath.node.id.name] = deepPath.node.callee.name;
                                }
                            }
                        })
                    }
                }
            })
        }
    }
};

function postProcessing(state){
    if (state.currentFile) delete state.currentFile;
    if (state.dependencies) delete state.dependencies;

    state.status = true;
}

export { state, visitors, postProcessing };
