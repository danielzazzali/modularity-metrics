## Functions Coupling Metric

### Overview

The **Functions Coupling** metric analyzes each JavaScript (or TypeScript) file in your codebase to collect all standalone functions—whether declared, expressed, or arrow‑style—and measures how they call one another. Specifically, it records:

* **Fan‑Out**: for each function, how many times it invokes each other function in the same file.
* **Fan‑In**: for each function, how many times it is invoked by each other function in the same file.

This helps you understand the degree of interdependence between functions and spot areas of high coupling.

### How It Works

1. **Initialization**

   * A shared `state` object is initialized with:

     * `name` and `description` strings.
     * An empty `result` map.
     * An `id` (`'function-coupling'`) and a dependency on `'functions-per-file'` (which provides the list of functions present in each file).
     * `status` set to `false` until processing completes .

2. **Program Entry**

   * **`Program(path)`**: on entering each file’s AST, it sets `state.currentFile = path.node.filePath` and seeds `state.result` from the previously computed `"functions-per-file"` data .

3. **Function Visitors**
   For each of these node types:

   * **`FunctionDeclaration`**
   * **`FunctionExpression`**
   * **`ArrowFunctionExpression`**

   the metric:

   1. Determines the **caller function name** by checking `path.node.id.name` or, if anonymous, the parent `VariableDeclarator` name.
   2. Uses `path.traverse({ CallExpression(innerPath) { … } })` to locate every call within the function body.
   3. For each `CallExpression` where `innerPath.node.callee.name` exists:

      * **Fan‑Out Update**:

        ```js
        state.result[currentFile][callerFunction]['fan-out'][calleeFunction]++  
        ```
      * **Fan‑In Update**:

        ```js
        state.result[currentFile][calleeFunction]['fan-in'][callerFunction]++  
        ```

      These updates ensure that for each invocation, the caller’s `fan-out` and the callee’s `fan-in` counters are incremented .

4. **Post‑Processing**
   Once traversal finishes:

   * Internal fields `currentFile` and `dependencies` are removed.
   * `state.status` is set to `true` .

---

## Output Interface

When you serialize the final `state` (e.g., via `JSON.stringify(state)`), you get a JSON object with exactly these four top‑level properties:

| Field         | Type                            | Description                                                               |
| ------------- | ------------------------------- | ------------------------------------------------------------------------- |
| `name`        | `string`                        | Human‑readable metric name (e.g. `"Functions Coupling"`).                 |
| `description` | `string`                        | Human‑readable description of what the metric computes.                   |
| `result`      | `Record<string, FileFunctions>` | Map from **file path** to a map of **function name** → **coupling info**. |
| `status`      | `boolean`                       | Always `true` once post‑processing completes successfully.                |

### `FileFunctions`

```ts
type FileFunctions = Record<
  FunctionName,
  FunctionCouplingInfo
>;
```

* **`FunctionName`**: the identifier string for the function (either declaration name, variable name for expressions, or variable name for arrow functions).

### `FunctionCouplingInfo`

Describes one function’s AST metadata plus its coupling counts:

```ts
interface FunctionCouplingInfo {
  // === AST metadata ===
  type: "FunctionDeclaration"
        | "FunctionExpression"
        | "ArrowFunctionExpression";
  id: { type: "Identifier"; name: string } | null;
  generator: boolean;
  async: boolean;
  params: any[];   // array of AST nodes for parameters
  body: object;    // AST node for the function body (BlockStatement)

  // === Coupling data ===
  "fan-out"?: Record< CalleeFunctionName, number >;
  "fan-in"?:  Record< CallerFunctionName, number >;
}
```

* **`fan-out`** (optional): for this function, a map of each callee function name → number of calls.
* **`fan-in`** (optional): for this function, a map of each caller function name → number of calls.

---

## Example

Given this source file:

```js
// 1. Function Declaration
function functionA() {
    functionB();
}

// 2. Function Expression
const functionB = function () {
    functionC();
};

// 3. Arrow Function Expression
const functionC = () => {
    functionA();
};
```

The metric produces:

```json
{
  "name": "Functions Coupling",
  "description": "Collects all function declarations, function expressions, and arrow functions in each file, grouping them by file path based on the “files” dependency.",
  "result": {
    "/path/to/functions-coupled.js": {
      "functionA": {
        "type": "FunctionDeclaration",
        "id": { "type": "Identifier", "name": "functionA" },
        "generator": false,
        "async": false,
        "params": [],
        "body": { /* BlockStatement AST */ },
        "fan-out": { "functionB": 1 },
        "fan-in":  { "functionC": 1 }
      },
      "functionB": {
        "type": "FunctionExpression",
        "id": null,
        "generator": false,
        "async": false,
        "params": [],
        "body": { /* BlockStatement AST */ },
        "fan-out": { "functionC": 1 },
        "fan-in":  { "functionA": 1 }
      },
      "functionC": {
        "type": "ArrowFunctionExpression",
        "id": null,
        "generator": false,
        "async": false,
        "params": [],
        "body": { /* BlockStatement AST */ },
        "fan-out": { "functionA": 1 },
        "fan-in":  { "functionB": 1 }
      }
    }
  },
  "status": true
}
```

Use this specification to integrate the **Functions Coupling** metric into your analysis pipeline or to drive visual reports on function interdependencies.
