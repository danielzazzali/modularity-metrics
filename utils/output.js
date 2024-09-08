import { inspect } from 'node:util';

function printLine() {
    console.log('-'.repeat(80));
}

function prettyPrint(object) {
    printLine();
    console.log(inspect(object, { depth: null, colors: true }));
    printLine();
}

export { prettyPrint };