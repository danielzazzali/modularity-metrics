
/**
Javascript manage args like this:
    args[0]             args[1]        args[2]    args[3]     args[4]
    node-interpreter    mi-script.js   arg1       arg2        arg3
*/

export const LONG_ARGUMENT_INDICATOR = '--';
export const FLAG_INDICATOR = '-';
export const ARGUMENT_VALUE_SEPARATOR = '=';
export const FLAG_SEPARATOR = '';

export const ARGUMENT_INDICATOR_LENGTH = LONG_ARGUMENT_INDICATOR.length;
export const FLAG_INDICATOR_LENGTH = FLAG_INDICATOR.length;

export const PATH_ARGUMENT_NAME = 'path';

export const IGNORE_FILES_FILENAME = '.metricsignore';
export const NODE_MODULES_DIRECTORY = 'node_modules';

export const FILE_ENCODING = 'utf-8';

export const JS_EXTENSION = '.js';
export const TS_EXTENSION = '.ts';

export const LINE_BREAK = '\n';

export const BABEL_PARSER_OPTIONS = {
    sourceType: 'module',
    plugins: [
        'typescript'
    ]
};