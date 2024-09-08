import path from 'path';
import fs from 'fs';
import {
    ARGUMENT_INDICATOR_LENGTH,
    ARGUMENT_VALUE_SEPARATOR,
    FILE_ENCODING,
    FLAG_INDICATOR,
    FLAG_INDICATOR_LENGTH,
    FLAG_SEPARATOR,
    IGNORE_FILES_FILENAME,
    JS_EXTENSION,
    LINE_BREAK,
    LONG_ARGUMENT_INDICATOR,
    NODE_MODULES_DIRECTORY,
    PATH_ARGUMENT_NAME,
    TS_EXTENSION
} from "../constants/constants.js";

function getArgs() {
    return process.argv.reduce((args, arg) => {

        if (arg.slice(0, ARGUMENT_INDICATOR_LENGTH) === LONG_ARGUMENT_INDICATOR) {
            const longArg = arg.split(ARGUMENT_VALUE_SEPARATOR);
            const longArgFlag = longArg[0].slice(ARGUMENT_INDICATOR_LENGTH);
            args[longArgFlag] = longArg.length > 1 ? longArg[1] : true;
        } else if (arg[0] === FLAG_INDICATOR) {
            const flags = arg.slice(FLAG_INDICATOR_LENGTH).split(FLAG_SEPARATOR);
            flags.forEach((flag) => {
                args[flag] = true;
            });
        }

        return args;
    }, {});
}

function getCustomPath(){
    const args = getArgs();
    return args[PATH_ARGUMENT_NAME];
}

function getIgnored(rootPath) {
    const ignorePath = path.join(rootPath, IGNORE_FILES_FILENAME);
    let ignoreFiles = [];
    if (fs.existsSync(ignorePath)) {
        ignoreFiles = fs.readFileSync(ignorePath, FILE_ENCODING).split(LINE_BREAK).map(line => path.join(rootPath, line));
    }
    return ignoreFiles;
}

function isSupported(absolute) {
    return path.extname(absolute) === JS_EXTENSION
    || path.extname(absolute) === TS_EXTENSION;
}

function readDirectory(directory, ignoreFiles, arrayOfFiles) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const absolute = path.join(directory, file);

        if(absolute.includes(NODE_MODULES_DIRECTORY)){
            continue;
        }

        if (ignoreFiles.includes(absolute)) {
            continue;
        }

        if (fs.statSync(absolute).isDirectory()) {
            readDirectory(absolute, ignoreFiles, arrayOfFiles);
        } else if (isSupported(absolute)) {
            arrayOfFiles.push({
                filePath: absolute,
                fileName: path.basename(absolute)
            });
        }
    }
}

function getFiles() {
    let arrayOfFiles = [];
    const path = getCustomPath() || process.cwd();

    const ignoreFiles = getIgnored(path);
    readDirectory(path, ignoreFiles, arrayOfFiles);

    return arrayOfFiles;
}

export { getFiles };