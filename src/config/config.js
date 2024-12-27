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

    get metricsPath() {
        return this._metricsPath;
    }

    set metricsPath(metricsPath) {
        this._metricsPath = metricsPath || null;
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