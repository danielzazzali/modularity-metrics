import { prettyPrint } from "./utils/output.js";
import { getAllASTs } from "./utils/ast.js";
import { calculateFanMetrics } from "./metrics/fan.js";

const ASTs = getAllASTs();

const fanMetricsResults = calculateFanMetrics(ASTs);

prettyPrint(fanMetricsResults);