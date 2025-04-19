const state = {
    id: 'a-metric',
    dependencies: ['b-metric']
};

const visitors = [
    {
        Program: {
            enter(path, state) {
                state.currentFile = path.parent.loc?.filePath || null;

                console.log(state.currentFile)
            },
            exit(path, state) {
                console.log("exit", state.currentFile)
            }
        }
    }
];

export { state, visitors };
