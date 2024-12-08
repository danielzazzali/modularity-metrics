class Config {
    constructor() {
        if (Config.instance) {
            return Config.instance;
        }
        Config.instance = this;

        this._path = null;
    }

    get path() {
        return this._path || process.cwd();
    }

    set path(path) {
        this._path = path;
    }
}

const config = new Config();

export { config };