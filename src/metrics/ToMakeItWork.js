const state = {
    name: "Class Fan",
    description: '',
    result: {},
    id: 'visitors-class-fan',
    dependencies: ['classes-per-file']
};

const visitors = {
    // Entry point for each parsed file, load dependency
    Program(path) {
        state.currentFile = path.node.filePath;
        state.result[state.currentFile] = state.dependencies['classes-per-file'][state.currentFile];
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


            // EN ESTE PUNTO SE ALMACENABA EL NODO Y SE DETENIA LA EJECUCION:
            // state.result[state.currentFile][node.id.name] = path.node;
            // Ahora, en vez de detener la ejecucion, seguiremos escarbando en el nodo...

            // obtengamos el nombre de la clase
            const currentClass = node.id.name;

            // Creemos una propiedad dentro del nodo de la clase para almacenar el fan-out:
            state.result[state.currentFile][currentClass]['fan-out'] = {};

            // Luego el algoritmo sigue de la siguiente forma:

            // En este punto tenemos una clase de interés, comenzamos el analisis de sus metodos:

            // for cada file que hayamos visto en el repo
                // por cada clase que hayamos visto en el repo
                    // visitaremos los newExpresion del body de esta clase de esta clase actual usando path.traverse({visitor})
                        // Si el callee es un Identifier y el nombre de ese callee es de la clase ya vista en el repo
                            // Lo consideraremos como una llamada de la clase actual hacia newExpression del callee.name

            for (const file in state.result) {
                for (const classToSearch in state.result[file]) {
                    path.traverse(
                        {
                            NewExpression(innerPath) {
                                if (innerPath.node.callee.type === 'Identifier' && innerPath.node.callee.name === classToSearch) {
                                    if (!state.result[file][currentClass]['fan-out'][classToSearch]) {
                                        state.result[file][currentClass]['fan-out'][classToSearch] = {};
                                    }

                                    if (!(state.result[file][currentClass]['fan-out'][classToSearch]['newExpression'])) {
                                        state.result[file][currentClass]['fan-out'][classToSearch]['newExpression'] = 0;
                                    }

                                    state.result[file][currentClass]['fan-out'][classToSearch]['newExpression']++;
                                }
                            },
                        }
                    )
                }
            }

            return;
        }

        /* Examples:
           export default class {}
           export default class Foo{}
        */
        // if (parentPath.node.type === 'ExportDefaultDeclaration') {
        //
        //     // Classes with default export will be referenced by the name of the file
        //     const className = state.currentFile
        //         .split('/')
        //         .pop()
        //         .replace(/\.(js|ts)$/, '');
        //
        //     state.result[state.currentFile][className] = path.node;
        //     return;
        // }
    },

    // ClassExpression(path) {
    //     const node = path.node;
    //     const parentPath = path.parentPath;
    //
    //     /* Examples:
    //        const Logger = class {}
    //     */
    //     if (parentPath.node.type === 'VariableDeclarator' &&
    //         parentPath.node.id &&
    //         parentPath.node.id.name
    //     ) {
    //
    //         /* Ignore:
    //            (() => { <Class_expression_here> })();
    //         */
    //         if (parentPath.find(p => p.isCallExpression())) {
    //             return;
    //         }
    //
    //         /* Ignore:
    //            class SuperCalculator extends class {}
    //         */
    //         if (node.superClass &&
    //             node.superClass.type === 'ClassExpression'
    //         ) {
    //             return;
    //         }
    //
    //         state.result[state.currentFile][parentPath.node.id.name] = path.node;
    //         return;
    //     }
    //
    //     /* Examples:
    //        { ['LiteralClassName']: class {} }
    //     */
    //     if (parentPath.node.type === 'ObjectProperty' &&
    //         parentPath.node.key &&
    //         parentPath.node.key.type === 'StringLiteral'
    //     ) {
    //         state.result[state.currentFile][parentPath.node.key.value] = path.node;
    //         return;
    //     }
    //
    //     /* Examples:
    //        { Printer: class {} }
    //     */
    //     if (parentPath.node.type === 'ObjectProperty' &&
    //         parentPath.node.key &&
    //         parentPath.node.key.type === 'Identifier' &&
    //         parentPath.node.computed === false
    //     ) {
    //         state.result[state.currentFile][parentPath.node.key.name] = path.node;
    //         return;
    //     }
    // }
};

function postProcessing(state){
    if (state.currentFile) delete state.currentFile;
    if (state.dependencies) delete state.dependencies;

    console.log(JSON.stringify(state, null, 2));
}

export { state, visitors, postProcessing };
