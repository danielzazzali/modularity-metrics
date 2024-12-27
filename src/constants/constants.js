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

export const METRICS_PATH = 'src/metrics';

export const MESSAGES = {
    ERRORS: {
        ERROR_ON_FILE: 'Error on file',
        ERROR_READING_IGNORE_FILE: 'Error reading .ignore file at',
        ERROR_NO_METRICS: 'No metrics provided and useDefaultMetrics is set to false',
        MISSING_EXPORTS: 'Missing required exports: state, visitors, postProcessing (optional).',
        PROCESSING_ERROR: 'Error processing metric file'
    }
};