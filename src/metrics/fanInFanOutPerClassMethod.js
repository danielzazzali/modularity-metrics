const state = {
    metricName: "Fan In Fan Out Per Class Method",
    description: "This metric counts the number of classes that a class method calls (Fan Out) and the number of classes that call a class method (Fan In).",
    version: "0.0.1",
    results: {},
    currentFile: null,
    currentClass: null,
    currentMethod: null
};

const visitors = {
    Program(pathNode, state) {
        state.currentFile = pathNode.node.loc.filename;
    },
    ClassDeclaration(pathNode, state) {
        const className = pathNode.node.id.name;
        if (!state.results[state.currentFile]) {
            state.results[state.currentFile] = {};
        }
        if (!state.results[state.currentFile][className]) {
            state.results[state.currentFile][className] = {};
        }
        state.currentClass = className;
    },
    ClassMethod(pathNode, state) {
        let methodName = pathNode.node.key.name;
        const currentClass = state.currentClass;

        if (methodName === 'constructor') {
            methodName = 'Constructor';
        }

        if (currentClass && methodName) {
            if (!state.results[state.currentFile][currentClass][methodName]) {
                state.results[state.currentFile][currentClass][methodName] = [];
            }
            state.currentMethod = methodName;
        }
    },
    CallExpression(pathNode, state) {
        const callee = pathNode.node.callee;
        const currentClass = state.currentClass;
        const currentMethod = state.currentMethod;

        if (!currentClass || !currentMethod) return;

        if (callee.type === "MemberExpression") {
            const calledClass = callee.object.name;
            const calledMethod = callee.property.name;

            if (calledClass && calledMethod) {
                const calls = state.results[state.currentFile][currentClass][currentMethod];
                const calledKey = `${calledClass}.${calledMethod}`;

                if (!calls.includes(calledKey)) {
                    calls.push(calledKey);
                }
            }
        }
    },
    NewExpression(pathNode, state) {
        const className = pathNode.node.callee.name;
        const currentClass = state.currentClass;
        const currentMethod = state.currentMethod;

        if (!currentClass || !currentMethod) return;

        if (className) {
            const calls = state.results[state.currentFile][currentClass][currentMethod];
            const calledKey = `${className}.Constructor`;

            if (!calls.includes(calledKey)) {
                calls.push(calledKey);
            }
        }
    }
};

function postProcessing(state) {
    const fanInOutResults = {};

    for (const [file, classes] of Object.entries(state.results)) {
        for (const [className, methods] of Object.entries(classes)) {
            for (const [methodName, calls] of Object.entries(methods)) {
                const currentKey = `${className}.${methodName}`;

                if (!fanInOutResults[currentKey]) {
                    fanInOutResults[currentKey] = { fanIn: [], fanOut: [] };
                }

                fanInOutResults[currentKey].fanOut.push(...calls);

                for (const call of calls) {
                    if (!fanInOutResults[call]) {
                        fanInOutResults[call] = { fanIn: [], fanOut: [] };
                    }
                    if (!fanInOutResults[call].fanIn.includes(currentKey)) {
                        fanInOutResults[call].fanIn.push(currentKey);
                    }
                }
            }
        }
    }

    state.results = fanInOutResults;

    delete state.currentFile;
    delete state.currentClass;
    delete state.currentMethod;
}



export { state, visitors, postProcessing };
