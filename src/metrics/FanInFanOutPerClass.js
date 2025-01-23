const state = {
    metricName: "Fan In Fan Out Per Class",
    description: "This metric counts the number of classes that a class calls (Fan Out) and the number of classes that call a class (Fan In).",
    version: "0.0.1",
    results: {},
    currentFile: null,
    currentClass: null
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
            state.results[state.currentFile][className] = new Set();
        }
        state.currentClass = className;
    },
    CallExpression(pathNode, state) {
        const callee = pathNode.node.callee;
        const currentClass = state.currentClass;

        if (!currentClass || !state.results[state.currentFile][currentClass]) return;

        if (callee.type === "MemberExpression") {
            const calledClass = callee.object.name;

            if (calledClass) {
                state.results[state.currentFile][currentClass].add(calledClass);
            }
        }
    }
};

function postProcessing(state) {
    const fanInOutResults = {};

    for (const [file, classes] of Object.entries(state.results)) {
        for (const [className, calledClasses] of Object.entries(classes)) {
            const currentKey = `${className}`;

            if (!fanInOutResults[currentKey]) {
                fanInOutResults[currentKey] = { fanIn: [], fanOut: [] };
            }

            for (const calledClass of calledClasses) {
                fanInOutResults[currentKey].fanOut.push(calledClass);

                if (!fanInOutResults[calledClass]) {
                    fanInOutResults[calledClass] = { fanIn: [], fanOut: [] };
                }

                if (!fanInOutResults[calledClass].fanIn.includes(currentKey)) {
                    fanInOutResults[calledClass].fanIn.push(currentKey);
                }
            }
        }
    }

    state.results = fanInOutResults;

    delete state.currentFile;
    delete state.currentClass;
}

export { state, visitors, postProcessing };