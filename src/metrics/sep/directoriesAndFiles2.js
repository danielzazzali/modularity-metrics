const state = {
    metricName: "Print Directories and Files",
    description: "This metric the directories and files",
    version: "1.0",
    result: {},
    id: '2',
    dependencies: [],
};

const visitors = [{
    Program(path, state) {
        state.currentFile = path.parent.loc?.filePath || null;
        console.log('EXECUTING', state.id)

        state.result.processed = true;
    },
}];

const postProcessing = (state) => {
    console.log('POSTPROCESSING', state.id);
};

export { state, visitors, postProcessing };