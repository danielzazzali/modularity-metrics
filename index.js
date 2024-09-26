import {prettyPrint} from "./utils/output.js";
import {getAllASTs} from "./utils/ast.js";
import {calculateFanOut, calculateFanIn} from "./metrics/fan.js"

const ASTs = getAllASTs()

const fanMetricsResults = ASTs.map(({ fileName, ast }) => {
    return {
        fileName,
        fanOut: calculateFanOut(ast),
        fanIn: calculateFanIn(ast)
    };
});

prettyPrint(fanMetricsResults);