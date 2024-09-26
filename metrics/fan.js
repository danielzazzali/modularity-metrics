import traverse from "@babel/traverse";

function calculateFanOut(ast) {
    const importedModules = new Set();

    traverse.default(ast, {
        ImportDeclaration({ node }) {
            importedModules.add(node.source.value);
        }
    });

    return importedModules;
}

function calculateFanIn(ast){


}

export { calculateFanOut, calculateFanIn }