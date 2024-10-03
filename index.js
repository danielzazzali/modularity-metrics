import { prettyPrint } from "./utils/output.js";
import { calculateFanMetrics } from "./metrics/fan.js";

const fanMetricsResults = calculateFanMetrics();

prettyPrint(fanMetricsResults);