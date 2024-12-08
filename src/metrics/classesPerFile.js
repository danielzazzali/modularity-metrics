// src/metrics/classesPerFile.js
const state = {
    results: [],
};

const visitors = {
    ClassDeclaration(path, state) {
        const className = path.node.id.name;
        state.results.push(className);
    },
    ClassExpression(path, state) {
        if (path.node.id) {
            const className = path.node.id.name;
            state.results.push(className);
        }
    }
};

const postProcessing = (state) => {
    const classes = {};

    state.results.forEach((className) => {
        if (!classes[className]) {
            classes[className] = [];
        }
        classes[className].push(className);
    });

    state.results = Object.keys(classes).map((fileName) => {
        return {
            filename: fileName,
            classes: classes[fileName]
        };
    });
};

export { state, visitors, postProcessing };