import { traverseASTs } from "../ast/astTraversal.js";

function getClassesVisitors() {
    return {
        ClassDeclaration(pathNode, state) {
            const className = pathNode.node.id.name;
            state.results.push(className);
        },
        ClassExpression(pathNode, state) {
            if (pathNode.node.id) {
                const className = pathNode.node.id.name;
                state.results.push(className);
            }
        }
    };
}


function calculateClassesPerFile() {
    const visitors = getClassesVisitors();
    const ASTResults = traverseASTs(visitors);

    const classes = {};

    ASTResults.forEach(({ fileName, results: classNames }) => {
        classes[fileName] = classNames;
    });

    return ASTResults.map(({ fileName }) => {
        return {
            filename: fileName,
            classes: classes[fileName]
        };
    });
}

export { calculateClassesPerFile };