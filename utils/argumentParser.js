import {
    ARGUMENT_INDICATOR_LENGTH,
    ARGUMENT_VALUE_SEPARATOR,
    FLAG_INDICATOR,
    FLAG_INDICATOR_LENGTH,
    FLAG_SEPARATOR,
    LONG_ARGUMENT_INDICATOR,
    PATH_ARGUMENT_NAME
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

function getCustomPath(args) {
    return args[PATH_ARGUMENT_NAME];
}

export { getArgs, getCustomPath };