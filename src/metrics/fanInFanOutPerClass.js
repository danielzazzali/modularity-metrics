import { traverseASTs } from "../ast/astTraversal.js";

function getVisitors() {
    return {
        ClassDeclaration(pathNode, state) {
            const className = pathNode.node.id.name;

            // Initialize the class metrics in the current file
            if (!state.results[className]) {
                state.results[className] = {
                    fanIn: [],
                    fanOut: [],
                    fileName: state.fileName, // Record the file where the class is defined
                };
            }

            state.currentClass = className; // Update the current class in the state
        },

        NewExpression(pathNode, state) {
            const instantiatedClass = pathNode.node.callee.name;
            const currentClass = state.currentClass;

            if (currentClass && instantiatedClass && currentClass !== instantiatedClass) {
                // The current class references another class
                if (!state.results[currentClass].fanOut.includes(instantiatedClass)) {
                    state.results[currentClass].fanOut.push(instantiatedClass);
                }
            }
        },

        MemberExpression(pathNode, state) {
            const objectName = pathNode.node.object.name;
            const currentClass = state.currentClass;

            if (currentClass && objectName && currentClass !== objectName) {
                // Detect the use of methods from another class
                if (!state.results[currentClass].fanOut.includes(objectName)) {
                    state.results[currentClass].fanOut.push(objectName);
                }
            }
        },
    };
}

function calculateFanInFanOutPerClass() {
    const visitors = getVisitors();
    const ASTResults = traverseASTs(visitors);

    const classMetricsByFile = {}; // Group metrics by file
    const classDefinitions = {}; // Global record of classes and their files

    // Collect class definitions and initial metrics
    ASTResults.forEach(({ fileName, results }) => {
        if (!classMetricsByFile[fileName]) {
            classMetricsByFile[fileName] = [];
        }

        Object.entries(results).forEach(([className, metrics]) => {
            classDefinitions[className] = fileName; // Record where the class is defined
            classMetricsByFile[fileName].push({
                className,
                fanIn: [],
                fanOut: metrics.fanOut,
            });
        });
    });

    // Calculate fan-in for referenced classes
    Object.entries(classDefinitions).forEach(([className, definingFile]) => {
        ASTResults.forEach(({ fileName, results }) => {
            Object.entries(results).forEach(([currentClass, metrics]) => {
                if (metrics.fanOut.includes(className) && fileName !== definingFile) {
                    const targetFileMetrics = classMetricsByFile[definingFile].find(
                        (metric) => metric.className === className
                    );

                    if (targetFileMetrics && !targetFileMetrics.fanIn.includes(currentClass)) {
                        targetFileMetrics.fanIn.push(currentClass);
                    }
                }
            });
        });
    });

    // Return metrics grouped by file
    return Object.entries(classMetricsByFile).map(([fileName, classMetrics]) => ({
        fileName,
        classMetrics,
    }));
}

export { calculateFanInFanOutPerClass };
