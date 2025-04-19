const state = {
    metricName: "Print Directories and Files",
    description: "This metric the directories and files",
    version: "1.0",
    result: {},
    id: '1',
    dependencies: ['2'],
};

const visitors = [{
    Program(path, state) {
        state.currentFile = path.parent.loc?.filePath || null;
        console.log('EXECUTING', state.id)

        state.result.processed = true;

        console.log('USING DEP', state.dependencyResults)
    },
}];

const postProcessing = (state) => {
    console.log('POSTPROCESSING', state.id);
};

export { state, visitors, postProcessing };