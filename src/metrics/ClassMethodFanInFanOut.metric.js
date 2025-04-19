const state = {
    result: {
        statistics: {
            totalMethods: 0,
            classMethods: 0
        },
        classes: []
    },
    id: '3',
    dependencies: [],
};

const visitors = [
    {
        ClassMethod(path) {
            handleMethod(path);
        },
        ClassProperty(path) {
            if (["FunctionExpression", "ArrowFunctionExpression"].includes(path.node.value?.type)) {
                handleMethod(path);
            }
        }
    }
];

function handleMethod(path) {
    const classParent = path.findParent(p => p.isClassDeclaration());
    if (!classParent) return;

    state.result.statistics.totalMethods++;
    state.result.statistics.classMethods++;

    const className = classParent.node.id ? classParent.node.id.name : "{anonymous}";
    let classEntry = state.result.classes.find(c => c.name === className);

    if (!classEntry) {
        classEntry = { name: className, methods: [] };
        state.result.classes.push(classEntry);
    }

    delete path.node.body;
    delete path.node["loc"];
    delete path.node["start"];
    delete path.node["end"];

    classEntry.methods.push(path.node);
}

export { state, visitors };
