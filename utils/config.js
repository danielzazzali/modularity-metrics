let config = {
    customPath: null
};

function setCustomPath(path) {
    config.customPath = path;
}

function getCustomPath() {
    return config.customPath;
}

export { setCustomPath, getCustomPath };