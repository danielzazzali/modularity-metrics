class Config {
    constructor() {
        if (Config.instance) {
            return Config.instance;
        }
        Config.instance = this;
    }

    get codePath() {
        return this._path;
    }

    set codePath(codePath) {
        this._path = codePath || process.cwd();
    }

    get customMetricsPath() {
        return this._customMetricsPath;
    }

    set customMetricsPath(customMetricsPath) {
        this._customMetricsPath = customMetricsPath || null;
    }

    get useDefaultMetrics() {
        return this._useDefaultMetrics;
    }

    set useDefaultMetrics(useDefaultMetrics) {
        this._useDefaultMetrics = useDefaultMetrics !== false;
    }
}

const config = new Config();

export { config };