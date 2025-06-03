import traverse from "@babel/traverse";
import * as t from "@babel/types";

const state = {
    name: "Class Fan-In and Fan-Out",
    description: "",
    result: {},
    id: 'class-fan',
    dependencies: ['classes-per-file']
};

const visitors = {
    // Entry point for each parsed file, load dependency
    Program(path) {
        state.currentFile = path.node.filePath;
        state.result[state.currentFile] = state.dependencies['classes-per-file'][state.currentFile];
    },
};


function calculateFan(result) {
    for (const file in result) {
        for (const className in result[file]) {
            countFanOut(className);
        }
    }
}


function countFanOut(classSearched) {
    for (const file in state.result) {
        for (const className in state.result[file]) {

            const node = state.result[file][className];
            state.result[file][className]['fan-out'] = {};

            const reconstructedAST = t.file(t.program([
                node
            ]));

            traverse.default(reconstructedAST, {
                NewExpression(innerPath) {
                    if (innerPath.node.callee.type === 'Identifier' && innerPath.node.callee.name === classSearched) {
                        if (!state.result[file][className]['fan-out'][classSearched]) {
                            state.result[file][className]['fan-out'][classSearched] = {};
                        }

                        if (!(state.result[file][className]['fan-out'][classSearched]['newExpression'])) {
                            state.result[file][className]['fan-out'][classSearched]['newExpression'] = 0;
                        }

                        state.result[file][className]['fan-out'][classSearched]['newExpression']++;
                    }
                },
            });
        }
    }
}


function postProcessing(state){
    calculateFan(state.result);
    if (state.currentFile) delete state.currentFile;
    if (state.dependencies) delete state.dependencies;

    console.log(JSON.stringify(state, null, 2));
}

export { state, visitors, postProcessing };
