export const LIBRARY_NAME = 'metrics-wizard';
export const IGNORE_FILES_FILENAME = '.metricsignore';
export const NODE_MODULES_DIRECTORY = 'node_modules';

export const FILE_ENCODING = 'utf-8';

export const JS_EXTENSION = '.js';
export const TS_EXTENSION = '.ts';

export const LINE_BREAK = '\n';

export const BABEL_PARSER_OPTIONS = {
    sourceType: "unambiguous",
    plugins: [
        "typescript",
        "jsx"
    ]
};

export const METRICS_PATH = 'metrics';

export const MESSAGES = {
    ERRORS: {
        ERROR_ON_FILE: 'Error on file',
        ERROR_READING_IGNORE_FILE: 'Error reading .ignore file at',
        ERROR_NO_METRICS: 'No metrics provided and useDefaultMetrics is set to false',
        MISSING_EXPORTS: 'Skipping metric file because it lacks the required exports { state, visitors }',
        PROCESSING_ERROR: 'Error processing metric file',
        ERROR_READING_SOURCE_CODE: 'Error reading source code on',
        ERROR_TRAVERSING_AST: 'Error traversing AST:'
    },
    INFO: {
        SKIPPING_FILE: 'Skipping file...'
    }
};