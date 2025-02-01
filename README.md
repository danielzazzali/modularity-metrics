# Modularity Metrics

This library is designed to calculate various code metrics for JavaScript and TypeScript files. It processes the code files, generates Abstract Syntax Trees (ASTs), and applies different modular metrics to analyze code structure, maintainability, and quality.

## Installation

To install the library, run:

```sh
npm install modularity-metrics
```

## Usage

To use the library, import the `calculateMetrics` function and call it with the appropriate parameters:

```js
import { calculateMetrics } from 'modularity-metrics';

const results = await calculateMetrics({
    codePath: './path/to/code', // Required
    customMetricsPath: './path/to/custom/metrics', // Optional 
    useDefaultMetrics: true // or false to disable metrics provided by modularity-metrics (Optional - Default: true)
});

console.log(results);
```

### Parameters

* `codePath` (string): The path to the code directory to analyze.
* `customMetricsPath` (string): The path to the custom metrics directory.
* `useDefaultMetrics` (boolean): Whether to use the default metrics.

## Metrics
The library includes several built-in metrics:

* Classes Per File: Counts the number of classes in each file.
* Methods Per File: Counts the number of methods in each file.
* Import/Export Coupling: Counts the number of files that a file imports and the number of files that import a file.
* Fan In Fan Out Per Class: Counts the number of classes that a class calls (Fan Out) and the number of classes that call a class (Fan In).
* Fan In Fan Out Per Class Method: Counts the number of classes that a class method calls (Fan Out) and the number of classes that call a class method (Fan In).

## Adding Custom Metrics

To add custom metrics, create a new module in the custom metrics directory and export the following:

* `state`: The initial state of the metric.
* `visitors`: An array of grouped visitors to traverse the AST, from first to last in execution order.
* `postProcessing` (optional): A function to perform post-processing on the collected data.

Example:

```js
const state = {
    metricName: "Custom Metric",
    description: "Description of the custom metric.",
    version: "0.0.1",
    results: [],
    // Define state properties here
};

const visitors = [{
    // Define visitors here
}];

function postProcessing(state) {
    // Perform post-processing here
}

export { state, visitors, postProcessing };
```