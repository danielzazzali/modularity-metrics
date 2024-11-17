class Config {
    constructor() {
        this._customPath = null;
    }

    get customPath() {
        return this._customPath;
    }

    set customPath(path) {
        this._customPath = path;
    }
}

const config = new Config();

export { config };
