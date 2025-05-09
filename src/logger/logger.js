class ErrorLogger {
    constructor() {
        this.parseErrors  = [];
        this.metricErrors = [];
        this.traverseErrors    = [];
    }

    static getInstance() {
        if (!ErrorLogger.instance) {
            ErrorLogger.instance = new ErrorLogger();
        }
        return ErrorLogger.instance;
    }

    logParseError(msg) {
        this.parseErrors.push(msg);
    }

    logMetricError(msg) {
        this.metricErrors.push(msg);
    }

    logTraverseError(msg) {
        this.traverseErrors.push(msg);
    }

    getParseErrors() {
        return [...this.parseErrors];
    }

    getMetricErrors() {
        return [...this.metricErrors];
    }

    getTraverseErrors() {
        return [...this.traverseErrors];
    }

    flush() {
        if (this.parseErrors.length) {
            console.error("=== File Parsing Errors ===");
            this.parseErrors.forEach((e, i) => console.error(`${i + 1}. ${e}`));
        }
        if (this.metricErrors.length) {
            console.error("\n=== Metric Loading Errors ===");
            this.metricErrors.forEach((e, i) => console.error(`${i + 1}. ${e}`));
        }
        if (this.traverseErrors.length) {
            console.error("\n=== AST Traversal Errors ===");
            this.traverseErrors.forEach((e, i) => console.error(`${i + 1}. ${e}`));
        }
    }
}


export const logger = ErrorLogger.getInstance();
