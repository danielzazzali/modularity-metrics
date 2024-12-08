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

export const REQUIRE_CALLEE_NAME = 'require';

export const MESSAGES = {
    WARNINGS: {
        INVALID_METRIC: 'Invalid metric: ',
        UNRECOGNIZED_METRIC: 'Metric is not recognized.',
    },
    ERRORS: {
        ERROR_ON_FILE: 'Error on file',
        ERROR_TRAVERSING_AST: 'Error while traversing the AST of file',
        ERROR_TRAVERSING_AST_MESSAGE: 'Error while traversing AST:',
        ERROR_FETCHING_ASTS: 'Error while fetching the ASTs:',
        FAILED_FETCHING_ASTS: 'Failed to fetch the ASTs.',
        ERROR_READING_IGNORE_FILE: 'Error reading .ignore file at',
        FAILED_TO_PARSE_FILE: 'Failed to parse file: ',
        LOADING_METRIC: 'Error loading metric',
        FROM: ' from ',
        ERROR_NO_METRICS: 'No metrics provided and useDefaultMetrics is set to false',
    },
    INFO: {
        DONE: 'Done!',
    }
};