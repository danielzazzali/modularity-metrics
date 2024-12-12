class Config {
    constructor() {
        if (Config.instance) {
            return Config.instance;
        }
        Config.instance = this;

        this._codePath = null;
        this._metricsPath = null;
    }

    get codePath() {
        return this._path || process.cwd();
    }

    set codePath(codePath) {
        this._path = codePath;
    }

    get metricsPath() {
        return this._metricsPath;
    }

    set metricsPath(metricsPath) {
        this._metricsPath = metricsPath;
    }
}

const config = new Config();

export { config };