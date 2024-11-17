import { traverseASTs } from "../ast/astTraversal.js";

function getVisitors() {
}

function calculateFanInFanOutPerClass() {
    const visitors = getVisitors();
    const ASTResults = traverseASTs(visitors);

}

export { calculateFanInFanOutPerClass };
