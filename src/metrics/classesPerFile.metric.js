import * as t from '@babel/types';

const state = {
    name: "Classes Per File",
    description: "Analyzes each source file to identify and record all top-level classes defined within it—capturing named class declarations, default-exported classes (using the file name as the key), class expressions assigned to variables, class expressions in string-literal object properties, and class expressions in object properties with identifier keys—while ignoring nested or anonymous inline class definitions.",
    result: {},
    id: 'classes-per-file',
    dependencies: ['files']
};

const visitors = {
    // Entry point for each parsed file, load dependency
    Program(path) {
        state.currentFile = path.node.filePath;
        state.result = state.dependencies['files'];
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
};

function initFileEntry(){
    if (!state.result[state.currentFile]) {
        state.result[state.currentFile] = {};
    }
}

function cleanMethods(result) {
    for (const file of Object.keys(result)) {
        const classes = result[file];
        for (const className of Object.keys(classes)) {
            const classNode = classes[className];

            classNode.body.body = classNode.body.body.filter(member => {
                // 1) Tipos permitidos (estándar + TS declare/abstract)
                const isStd =
                    t.isClassMethod(member) ||
                    t.isClassPrivateMethod(member) ||
                    t.isClassProperty(member) ||
                    t.isClassPrivateProperty(member);

                const isTSDecl =
                    t.isTSDeclareMethod(member) ||
                    t.isTSAbstractMethodDefinition?.(member) ||
                    t.isTSAbstractClassProperty?.(member);

                if (!(isStd || isTSDecl)) {
                    return false;
                }

                // 2) Los miembros privados (siempre tienen un PrivateName) se mantienen
                if (t.isClassPrivateMethod(member) || t.isClassPrivateProperty(member)) {
                    return true;
                }

                // 3) Para los miembros públicos: clave y computado...
                const { key, computed } = member;

                if (computed) {
                    // Solo permitimos computed si la clave es StringLiteral
                    return t.isStringLiteral(key);
                } else {
                    // No-computed: aceptamos Identifier, StringLiteral o NumericLiteral
                    return (
                        t.isIdentifier(key) ||
                        t.isStringLiteral(key) ||
                        t.isNumericLiteral(key)
                    );
                }
            });
        }
    }
}

function postProcessing(state){
    cleanMethods(state.result);
    if (state.currentFile) delete state.currentFile;
    if (state.dependencies) delete state.dependencies;
}

export { state, visitors, postProcessing };
