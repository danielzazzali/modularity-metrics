const state = {
    name: "Classes Per File",
    description: "Analyzes each source file to identify and record all top-level classes defined within it—capturing named class declarations, default-exported classes (using the file name as the key), class expressions assigned to variables, class expressions in string-literal object properties, and class expressions in object properties with identifier keys—while ignoring nested or anonymous inline class definitions.",
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

                state.result[state.currentFile][node.id.name] = path.node;
                return;
            }

            /* Examples:
            export default class {}
            export default class Foo{}
            */
            if (parentPath.node.type === 'ExportDefaultDeclaration') {

                // Classes with default export will be referenced by the name of the file
                const className = state.currentFile
                                        .split('/')
                                        .pop()
                                        .replace(/\.(js|ts)$/, '');

                state.result[state.currentFile][className] = path.node;
                return;
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

                state.result[state.currentFile][parentPath.node.id.name] = path.node;
                return;
            }

            /* Examples:
            { ['LiteralClassName']: class {} }
            */
            if (parentPath.node.type === 'ObjectProperty' &&
                parentPath.node.key &&
                parentPath.node.key.type === 'StringLiteral'
            ) {
                state.result[state.currentFile][parentPath.node.key.value] = path.node;
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
                state.result[state.currentFile][parentPath.node.key.name] = path.node;
                return;
            }
        }
    }
];

function initFileEntry(){
    if (!state.result[state.currentFile]) {
        state.result[state.currentFile] = {};
    }
}

function postProcessing(state){
    if (state.currentFile) delete state.currentFile;
    state.result = state.dependencies;
    if (state.dependencies) delete state.dependencies;
}

export { state, visitors, postProcessing };
