## Class Coupling Metric

### Overview

The **Class Coupling** metric walks every JavaScript or TypeScript file in your codebase and, for each class it finds, measures:

* **Fan‑Out**: how many times each method in that class calls methods (or constructors) of *other* classes.
* **Fan‑In**: how many times each method of *other* classes calls methods (or constructors) of this class.

This helps quantify the degree of interdependence between classes (high coupling can signal poor modularity).

### How It Works

1. **Initialization**

    * A shared `state` object holds:

        * `name` and `description` (for reporting purposes).
        * An initially empty `result` map, keyed by file path.
        * `id` (the metric’s identifier) and `dependencies` (other metrics that must run first).
        * A `status` flag (set to `false` until post‑processing completes).

2. **Visitor Traversal**

    * **Program** entry point: registers each file in `state.result` with its classes (using a prior “classes‑per‑file” metric).
    * **ClassDeclaration** and various **ClassExpression** forms: for each method (`ClassMethod`), traverse its body to catch:

        * **`NewExpression`** → counts as a call to the target class’s constructor (`_constructor`).
        * **`CallExpression`** → counts as a call to a specific method, whether on an identifier, a property of `this`, or a default export.
    * Whenever a call is detected:

        1. Locate the *callee* class and method index in `state.result`.
        2. Increment the corresponding `fan‑out[calleeClass][calleeMethod]` on the *caller* side.
        3. Increment the corresponding `fan‑in[callerClass][callerMethod]` on the *callee* side.

3. **Post‑Processing**
   After traversal completes:

    * Remove internal bookkeeping fields (`currentFile`, `dependencies`).
    * Set `state.status = true`.

---

## Output Interface

When serialized (e.g. via `JSON.stringify(state)`), the metric emits a JSON object with exactly these four top‑level fields:

| Field         | Type                         | Description                                                                             |
| ------------- | ---------------------------- | --------------------------------------------------------------------------------------- |
| `name`        | `string`                     | Human‑readable metric name (e.g. `"Class Coupling"`).                                   |
| `description` | `string`                     | Human‑readable description.                                                             |
| `result`      | `Record<string,FileClasses>` | Mapping **file path** → **classes in that file** → **list of method coupling entries**. |
| `status`      | `boolean`                    | Always `true` once post‑processing finishes successfully.                               |

### `FileClasses`

```ts
type FileClasses = Record<
  ClassName,
  MethodCouplingInfo[]
>;
```

* **`ClassName`**: the name of a class (string).

### `MethodCouplingInfo`

Each element in the array describes one class method (or constructor) and its coupling:

```ts
interface MethodCouplingInfo {
  // === AST metadata ===
  type: "ClassMethod";
  static: boolean;
  key: { type: "Identifier"; name: string };
  computed: boolean;
  kind: "constructor" | "method";
  id: null;               // always null for class methods
  generator: boolean;
  async: boolean;
  params: any[];          // AST nodes for parameters
  body: object;           // AST node for the method body (BlockStatement)

  // === Coupling data ===
  "fan-out"?: Record<
    CalleeClassName,
    Record<CalleeMethodName, number>
  >;
  "fan-in"?: Record<
    CallerClassName,
    Record<CallerMethodName, number>
  >;
}
```

* **`fan-out`** (optional): for this method, how many times it calls each method (or constructor) of each other class.
* **`fan-in`** (optional): for this method, how many times it is called by each method of each other class.

---

## Example

Given your two‑class example:

```js
class Garage {
  constructor() {
    this.car = new Car();
    this.car.start();
    Car.report();
  }
  service() { /* … */ }
  static notify() { /* … */ }
}
const Car = class {
  constructor() { /* … */ }
  start() { /* … */ }
  static report() { /* … */ }
};
```

The resulting JSON will look like:

```json
{
  "name": "Class Coupling",
  "description": "Analyzes each class to identify Fan‑Out and Fan‑In",
  "result": {
    "/path/.../coupling.js": {
      "Garage": [
        {
          "type": "ClassMethod",
          "static": false,
          "key": { "type": "Identifier", "name": "constructor" },
          /* … AST body … */,
          "fan-out": { "Car": { "_constructor": 1, "start": 1, "report": 1 } },
          "fan-in":  { "Car": { "report": 1 } }
        },
        /* service and notify entries… */
      ],
      "Car": [
        /* constructor, start, report entries… */
      ]
    }
  },
  "status": true
}
```
Use this specification to integrate the Class Coupling metric into your pipeline or to generate downstream reports.