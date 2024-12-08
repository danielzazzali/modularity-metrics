const state = {
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
            state.results[state.currentFile][className] = { fanIn: [], fanOut: [] };
        }
        state.currentClass = className;
    },
    NewExpression(pathNode, state) {
        const instantiatedClass = pathNode.node.callee.name;
        const currentClass = state.currentClass;
        if (currentClass && instantiatedClass && currentClass !== instantiatedClass) {
            if (!state.results[state.currentFile][currentClass].fanOut.includes(instantiatedClass)) {
                state.results[state.currentFile][currentClass].fanOut.push(instantiatedClass);
            }
        }
    },
    MemberExpression(pathNode, state) {
        const objectName = pathNode.node.object.name;
        const currentClass = state.currentClass;
        if (currentClass && objectName && currentClass !== objectName) {
            if (!state.results[state.currentFile][currentClass].fanOut.includes(objectName)) {
                state.results[state.currentFile][currentClass].fanOut.push(objectName);
            }
        }
    }
};

function postProcessing(state) {
    const fanInMap = {};

    for (const [fileName, classes] of Object.entries(state.results)) {
        for (const [className, { fanOut }] of Object.entries(classes)) {
            fanOut.forEach((referencedClass) => {
                if (!fanInMap[referencedClass]) {
                    fanInMap[referencedClass] = [];
                }
                fanInMap[referencedClass].push(className);
            });
        }
    }

    for (const [fileName, classes] of Object.entries(state.results)) {
        for (const [className, metrics] of Object.entries(classes)) {
            metrics.fanIn = fanInMap[className] || [];
        }
    }

    delete state.currentFile;
    delete state.currentClass;
}

export { state, visitors, postProcessing };