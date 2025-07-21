const state = {
    name: "Class Coupling",
    description: "Analyzes each class to identify Fan-Out and Fan-In",
    result: {},
    id: 'class-coupling',
    dependencies: ['classes-per-file', 'instance-mapper'],
    status: false
};

const visitors = {
    // Entry point for each parsed file, load dependency
    Program(path) {
        state.currentFile = path.node.filePath;
        state.result[state.currentFile] = state.dependencies['classes-per-file'][state.currentFile];
    },

    ClassDeclaration(path) {
        const node = path.node;
        const parentPath = path.parentPath;

        /* Examples:
           class Calculator {}
           class AdvancedCalculator extends Calculator {}

           parentPath.node.type === 'Program' -> Consider only file block class declarations
           Ignore: (() => { <Class_declaration_here> })();
        */
        if (node.id &&
            node.id.name &&
            parentPath.node.type === 'Program'
        ) {
            /* Ignore:
               class SuperCalculator extends class {}
            */
            if (node.superClass &&
                node.superClass.type === 'ClassExpression'
            ) {
                return;
            }

            const callerClass = node.id.name

            path.traverse({
                ClassMethod(innerPath) {
                    innerPath.traverse({
                        NewExpression(deepPath) {
                            /* Example:
                            new ClassF();

                            Count the call to 'constructor' method (_constructor)
                            */
                            let callerMethod = innerPath.node.key.name;
                            const calleeClass = deepPath.node.callee.name;
                            let calleeMethod = '_constructor';

                            let count = false;
                            let calleeMethodIndex = 0;
                            let calleeFilepath = '';

                            for (const [filePath, classes] of Object.entries(state.result)) {
                                // If the target class exists in this file
                                if (classes[calleeClass]) {
                                    // Check each method node in that class
                                    for (const methodNode of classes[calleeClass]) {
                                        if (methodNode.kind === 'constructor') {
                                            count = true;
                                            calleeFilepath = filePath;
                                            break;
                                        }
                                        calleeMethodIndex++;
                                    }
                                    break;
                                }
                            }

                            let callerMethodIndex = 0;

                            if (callerMethod === 'constructor') {
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    if (methodNode.kind === 'constructor') {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }
                            } else {
                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }
                            }

                            if (callerMethod === 'constructor') callerMethod = '_constructor'

                            if (count) {
                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                }

                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                }

                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                }

                                state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                }

                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                }

                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                }

                                state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                            }
                        },
                        CallExpression(deepPath) {
                            /* Example:
                            ClassF.foo()
                            myCar.start(); (Constant/Variable instance call)
                            */
                            if (deepPath.node.callee.type === 'MemberExpression' &&
                                deepPath.node.callee.object.type === 'Identifier' &&
                                deepPath.node.callee.property.type === 'Identifier'
                            ) {
                                let callerMethod = innerPath.node.key.name;
                                let calleeClass = state.dependencies['instance-mapper'][state.currentFile][callerClass][deepPath.node.callee.object.name];

                                if (calleeClass === undefined) {
                                    calleeClass = deepPath.node.callee.object.name;
                                }

                                let calleeMethod = deepPath.node.callee.property.name;

                                let count = false;
                                let calleeMethodIndex = 0;
                                let calleeFilepath = '';

                                for (const [filePath, classes] of Object.entries(state.result)) {
                                    // If the target class exists in this file
                                    if (classes[calleeClass]) {
                                        // Check each method node in that class
                                        for (const methodNode of classes[calleeClass]) {
                                            const possibleCalleeMethod = methodNode.key && methodNode.key.name;
                                            if (calleeMethod === possibleCalleeMethod) {
                                                count = true;
                                                calleeFilepath = filePath;
                                                break;
                                            }
                                            calleeMethodIndex++;
                                        }
                                        break;
                                    }
                                }

                                let callerMethodIndex = 0;

                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }

                                if (calleeMethod === 'constructor') calleeMethod = '_constructor'
                                if (callerMethod === 'constructor') callerMethod = '_constructor'

                                if (count) {
                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                    }

                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                    }

                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                                }

                                return;
                            }

                            /* Example:
                            this.car.start()

                            This case counts property instances
                            */
                            if (deepPath.node.callee.type === 'MemberExpression' &&
                                deepPath.node.callee.property.type === 'Identifier' &&
                                deepPath.node.callee.object.type === 'MemberExpression' &&
                                deepPath.node.callee.object.object.type === 'ThisExpression'
                            ) {
                                let callerMethod = innerPath.node.key.name;
                                const calleeClass = state.dependencies['instance-mapper'][state.currentFile][callerClass][`this.${deepPath.node.callee.object.property.name}`];
                                let calleeMethod = deepPath.node.callee.property.name;

                                let count = false;
                                let calleeMethodIndex = 0;
                                let calleeFilepath = '';

                                for (const [filePath, classes] of Object.entries(state.result)) {
                                    // If the target class exists in this file
                                    if (classes[calleeClass]) {
                                        // Check each method node in that class
                                        for (const methodNode of classes[calleeClass]) {
                                            const possibleCalleeMethod = methodNode.key && methodNode.key.name;
                                            if (calleeMethod === possibleCalleeMethod) {
                                                count = true;
                                                calleeFilepath = filePath;
                                                break;
                                            }
                                            calleeMethodIndex++;
                                        }
                                        break;
                                    }
                                }

                                let callerMethodIndex = 0;

                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }

                                if (calleeMethod === 'constructor') calleeMethod = '_constructor'
                                if (callerMethod === 'constructor') callerMethod = '_constructor'

                                if (count) {
                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                    }

                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                    }

                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                                }
                            }
                        }
                    })
                },
            })
        }

        /* Examples:
           export default class {}
           export default class Foo{}
        */
        if (parentPath.node.type === 'ExportDefaultDeclaration') {
            // Classes with default export will be referenced by the name of the file
            const callerClass = path.node.id
                ? path.node.id.name
                : state.currentFile
                    .split('/')
                    .pop()
                    .replace(/\.(js|ts)$/, '')

            path.traverse({
                ClassMethod(innerPath) {
                    innerPath.traverse({
                        NewExpression(deepPath) {
                            /* Example:
                            new ClassF();

                            Count the call to 'constructor' method (_constructor)
                            */
                            let callerMethod = innerPath.node.key.name;
                            const calleeClass = deepPath.node.callee.name;
                            let calleeMethod = '_constructor';

                            let count = false;
                            let calleeMethodIndex = 0;
                            let calleeFilepath = '';

                            for (const [filePath, classes] of Object.entries(state.result)) {
                                // If the target class exists in this file
                                if (classes[calleeClass]) {
                                    // Check each method node in that class
                                    for (const methodNode of classes[calleeClass]) {
                                        if (methodNode.kind === 'constructor') {
                                            count = true;
                                            calleeFilepath = filePath;
                                            break;
                                        }
                                        calleeMethodIndex++;
                                    }
                                    break;
                                }
                            }

                            let callerMethodIndex = 0;

                            if (callerMethod === 'constructor') {
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    if (methodNode.kind === 'constructor') {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }
                            } else {
                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }
                            }

                            if (callerMethod === 'constructor') callerMethod = '_constructor'

                            if (count) {
                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                }

                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                }

                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                }

                                state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                }

                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                }

                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                }

                                state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                            }
                        },
                        CallExpression(deepPath) {
                            /* Example:
                            ClassF.foo()
                            myCar.start(); (Constant/Variable instance call)
                            */
                            if (deepPath.node.callee.type === 'MemberExpression' &&
                                deepPath.node.callee.object.type === 'Identifier' &&
                                deepPath.node.callee.property.type === 'Identifier'
                            ) {
                                let callerMethod = innerPath.node.key.name;
                                let calleeClass = state.dependencies['instance-mapper'][state.currentFile][callerClass][deepPath.node.callee.object.name];

                                if (calleeClass === undefined) {
                                    calleeClass = deepPath.node.callee.object.name;
                                }

                                let calleeMethod = deepPath.node.callee.property.name;

                                let count = false;
                                let calleeMethodIndex = 0;
                                let calleeFilepath = '';

                                for (const [filePath, classes] of Object.entries(state.result)) {
                                    // If the target class exists in this file
                                    if (classes[calleeClass]) {
                                        // Check each method node in that class
                                        for (const methodNode of classes[calleeClass]) {
                                            const possibleCalleeMethod = methodNode.key && methodNode.key.name;
                                            if (calleeMethod === possibleCalleeMethod) {
                                                count = true;
                                                calleeFilepath = filePath;
                                                break;
                                            }
                                            calleeMethodIndex++;
                                        }
                                        break;
                                    }
                                }

                                let callerMethodIndex = 0;

                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }

                                if (calleeMethod === 'constructor') calleeMethod = '_constructor'
                                if (callerMethod === 'constructor') callerMethod = '_constructor'

                                if (count) {
                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                    }

                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                    }

                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                                }

                                return;
                            }

                            /* Example:
                            this.car.start()

                            This case counts property instances
                            */
                            if (deepPath.node.callee.type === 'MemberExpression' &&
                                deepPath.node.callee.property.type === 'Identifier' &&
                                deepPath.node.callee.object.type === 'MemberExpression' &&
                                deepPath.node.callee.object.object.type === 'ThisExpression'
                            ) {
                                let callerMethod = innerPath.node.key.name;
                                const calleeClass = state.dependencies['instance-mapper'][state.currentFile][callerClass][`this.${deepPath.node.callee.object.property.name}`];
                                let calleeMethod = deepPath.node.callee.property.name;

                                let count = false;
                                let calleeMethodIndex = 0;
                                let calleeFilepath = '';

                                for (const [filePath, classes] of Object.entries(state.result)) {
                                    // If the target class exists in this file
                                    if (classes[calleeClass]) {
                                        // Check each method node in that class
                                        for (const methodNode of classes[calleeClass]) {
                                            const possibleCalleeMethod = methodNode.key && methodNode.key.name;
                                            if (calleeMethod === possibleCalleeMethod) {
                                                count = true;
                                                calleeFilepath = filePath;
                                                break;
                                            }
                                            calleeMethodIndex++;
                                        }
                                        break;
                                    }
                                }

                                let callerMethodIndex = 0;

                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }

                                if (calleeMethod === 'constructor') calleeMethod = '_constructor'
                                if (callerMethod === 'constructor') callerMethod = '_constructor'

                                if (count) {
                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                    }

                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                    }

                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                                }
                            }
                        }
                    })
                },
            })
        }
    },

    ClassExpression(path) {
        const node = path.node;
        const parentPath = path.parentPath;

        /* Examples:
           const Logger = class {}
        */
        if (parentPath.node.type === 'VariableDeclarator' &&
            parentPath.node.id &&
            parentPath.node.id.name
        ) {

            /* Ignore:
               (() => { <Class_expression_here> })();
            */
            if (parentPath.find(p => p.isCallExpression())) {
                return;
            }

            /* Ignore:
               class SuperCalculator extends class {}
            */
            if (node.superClass &&
                node.superClass.type === 'ClassExpression'
            ) {
                return;
            }

            const callerClass = parentPath.node.id.name;

            path.traverse({
                ClassMethod(innerPath) {
                    innerPath.traverse({
                        NewExpression(deepPath) {
                            /* Example:
                            new ClassF();

                            Count the call to 'constructor' method (_constructor)
                            */
                            let callerMethod = innerPath.node.key.name;
                            const calleeClass = deepPath.node.callee.name;
                            let calleeMethod = '_constructor';

                            let count = false;
                            let calleeMethodIndex = 0;
                            let calleeFilepath = '';

                            for (const [filePath, classes] of Object.entries(state.result)) {
                                // If the target class exists in this file
                                if (classes[calleeClass]) {
                                    // Check each method node in that class
                                    for (const methodNode of classes[calleeClass]) {
                                        if (methodNode.kind === 'constructor') {
                                            count = true;
                                            calleeFilepath = filePath;
                                            break;
                                        }
                                        calleeMethodIndex++;
                                    }
                                    break;
                                }
                            }

                            let callerMethodIndex = 0;

                            if (callerMethod === 'constructor') {
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    if (methodNode.kind === 'constructor') {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }
                            } else {
                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }
                            }

                            if (callerMethod === 'constructor') callerMethod = '_constructor'

                            if (count) {
                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                }

                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                }

                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                }

                                state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                }

                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                }

                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                }

                                state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                            }
                        },
                        CallExpression(deepPath) {
                            /* Example:
                            ClassF.foo()
                            myCar.start(); (Constant/Variable instance call)
                            */
                            if (deepPath.node.callee.type === 'MemberExpression' &&
                                deepPath.node.callee.object.type === 'Identifier' &&
                                deepPath.node.callee.property.type === 'Identifier'
                            ) {
                                let callerMethod = innerPath.node.key.name;
                                let calleeClass = state.dependencies['instance-mapper'][state.currentFile][callerClass][deepPath.node.callee.object.name];

                                if (calleeClass === undefined) {
                                    calleeClass = deepPath.node.callee.object.name;
                                }

                                let calleeMethod = deepPath.node.callee.property.name;

                                let count = false;
                                let calleeMethodIndex = 0;
                                let calleeFilepath = '';

                                for (const [filePath, classes] of Object.entries(state.result)) {
                                    // If the target class exists in this file
                                    if (classes[calleeClass]) {
                                        // Check each method node in that class
                                        for (const methodNode of classes[calleeClass]) {
                                            const possibleCalleeMethod = methodNode.key && methodNode.key.name;
                                            if (calleeMethod === possibleCalleeMethod) {
                                                count = true;
                                                calleeFilepath = filePath;
                                                break;
                                            }
                                            calleeMethodIndex++;
                                        }
                                        break;
                                    }
                                }

                                let callerMethodIndex = 0;

                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }

                                if (calleeMethod === 'constructor') calleeMethod = '_constructor'
                                if (callerMethod === 'constructor') callerMethod = '_constructor'

                                if (count) {
                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                    }

                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                    }

                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                                }

                                return;
                            }

                            /* Example:
                            this.car.start()

                            This case counts property instances
                            */
                            if (deepPath.node.callee.type === 'MemberExpression' &&
                                deepPath.node.callee.property.type === 'Identifier' &&
                                deepPath.node.callee.object.type === 'MemberExpression' &&
                                deepPath.node.callee.object.object.type === 'ThisExpression'
                            ) {
                                let callerMethod = innerPath.node.key.name;
                                const calleeClass = state.dependencies['instance-mapper'][state.currentFile][callerClass][`this.${deepPath.node.callee.object.property.name}`];
                                let calleeMethod = deepPath.node.callee.property.name;

                                let count = false;
                                let calleeMethodIndex = 0;
                                let calleeFilepath = '';

                                for (const [filePath, classes] of Object.entries(state.result)) {
                                    // If the target class exists in this file
                                    if (classes[calleeClass]) {
                                        // Check each method node in that class
                                        for (const methodNode of classes[calleeClass]) {
                                            const possibleCalleeMethod = methodNode.key && methodNode.key.name;
                                            if (calleeMethod === possibleCalleeMethod) {
                                                count = true;
                                                calleeFilepath = filePath;
                                                break;
                                            }
                                            calleeMethodIndex++;
                                        }
                                        break;
                                    }
                                }

                                let callerMethodIndex = 0;

                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }

                                if (calleeMethod === 'constructor') calleeMethod = '_constructor'
                                if (callerMethod === 'constructor') callerMethod = '_constructor'

                                if (count) {
                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                    }

                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                    }

                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                                }
                            }
                        }
                    })
                },
            })

            return;
        }

        /* Examples:
           { ['LiteralClassName']: class {} }
        */
        if (parentPath.node.type === 'ObjectProperty' &&
            parentPath.node.key &&
            parentPath.node.key.type === 'StringLiteral'
        ) {
            const callerClass = parentPath.node.key.value;

            path.traverse({
                ClassMethod(innerPath) {
                    innerPath.traverse({
                        NewExpression(deepPath) {
                            /* Example:
                            new ClassF();

                            Count the call to 'constructor' method (_constructor)
                            */
                            let callerMethod = innerPath.node.key.name;
                            const calleeClass = deepPath.node.callee.name;
                            let calleeMethod = '_constructor';

                            let count = false;
                            let calleeMethodIndex = 0;
                            let calleeFilepath = '';

                            for (const [filePath, classes] of Object.entries(state.result)) {
                                // If the target class exists in this file
                                if (classes[calleeClass]) {
                                    // Check each method node in that class
                                    for (const methodNode of classes[calleeClass]) {
                                        if (methodNode.kind === 'constructor') {
                                            count = true;
                                            calleeFilepath = filePath;
                                            break;
                                        }
                                        calleeMethodIndex++;
                                    }
                                    break;
                                }
                            }

                            let callerMethodIndex = 0;

                            if (callerMethod === 'constructor') {
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    if (methodNode.kind === 'constructor') {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }
                            } else {
                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }
                            }

                            if (callerMethod === 'constructor') callerMethod = '_constructor'

                            if (count) {
                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                }

                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                }

                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                }

                                state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                }

                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                }

                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                }

                                state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                            }
                        },
                        CallExpression(deepPath) {
                            /* Example:
                            ClassF.foo()
                            myCar.start(); (Constant/Variable instance call)
                            */
                            if (deepPath.node.callee.type === 'MemberExpression' &&
                                deepPath.node.callee.object.type === 'Identifier' &&
                                deepPath.node.callee.property.type === 'Identifier'
                            ) {
                                let callerMethod = innerPath.node.key.name;
                                let calleeClass = state.dependencies['instance-mapper'][state.currentFile][callerClass][deepPath.node.callee.object.name];

                                if (calleeClass === undefined) {
                                    calleeClass = deepPath.node.callee.object.name;
                                }

                                let calleeMethod = deepPath.node.callee.property.name;

                                let count = false;
                                let calleeMethodIndex = 0;
                                let calleeFilepath = '';

                                for (const [filePath, classes] of Object.entries(state.result)) {
                                    // If the target class exists in this file
                                    if (classes[calleeClass]) {
                                        // Check each method node in that class
                                        for (const methodNode of classes[calleeClass]) {
                                            const possibleCalleeMethod = methodNode.key && methodNode.key.name;
                                            if (calleeMethod === possibleCalleeMethod) {
                                                count = true;
                                                calleeFilepath = filePath;
                                                break;
                                            }
                                            calleeMethodIndex++;
                                        }
                                        break;
                                    }
                                }

                                let callerMethodIndex = 0;

                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }

                                if (calleeMethod === 'constructor') calleeMethod = '_constructor'
                                if (callerMethod === 'constructor') callerMethod = '_constructor'

                                if (count) {
                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                    }

                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                    }

                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                                }

                                return;
                            }

                            /* Example:
                            this.car.start()

                            This case counts property instances
                            */
                            if (deepPath.node.callee.type === 'MemberExpression' &&
                                deepPath.node.callee.property.type === 'Identifier' &&
                                deepPath.node.callee.object.type === 'MemberExpression' &&
                                deepPath.node.callee.object.object.type === 'ThisExpression'
                            ) {
                                let callerMethod = innerPath.node.key.name;
                                const calleeClass = state.dependencies['instance-mapper'][state.currentFile][callerClass][`this.${deepPath.node.callee.object.property.name}`];
                                let calleeMethod = deepPath.node.callee.property.name;

                                let count = false;
                                let calleeMethodIndex = 0;
                                let calleeFilepath = '';

                                for (const [filePath, classes] of Object.entries(state.result)) {
                                    // If the target class exists in this file
                                    if (classes[calleeClass]) {
                                        // Check each method node in that class
                                        for (const methodNode of classes[calleeClass]) {
                                            const possibleCalleeMethod = methodNode.key && methodNode.key.name;
                                            if (calleeMethod === possibleCalleeMethod) {
                                                count = true;
                                                calleeFilepath = filePath;
                                                break;
                                            }
                                            calleeMethodIndex++;
                                        }
                                        break;
                                    }
                                }

                                let callerMethodIndex = 0;

                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }

                                if (calleeMethod === 'constructor') calleeMethod = '_constructor'
                                if (callerMethod === 'constructor') callerMethod = '_constructor'

                                if (count) {
                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                    }

                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                    }

                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                                }
                            }
                        }
                    })
                },
            })
        }

        /* Examples:
           { Printer: class {} }
        */
        if (parentPath.node.type === 'ObjectProperty' &&
            parentPath.node.key &&
            parentPath.node.key.type === 'Identifier' &&
            parentPath.node.computed === false
        ) {
            const callerClass = parentPath.node.key.name;

            path.traverse({
                ClassMethod(innerPath) {
                    innerPath.traverse({
                        NewExpression(deepPath) {
                            /* Example:
                            new ClassF();

                            Count the call to 'constructor' method (_constructor)
                            */
                            let callerMethod = innerPath.node.key.name;
                            const calleeClass = deepPath.node.callee.name;
                            let calleeMethod = '_constructor';

                            let count = false;
                            let calleeMethodIndex = 0;
                            let calleeFilepath = '';

                            for (const [filePath, classes] of Object.entries(state.result)) {
                                // If the target class exists in this file
                                if (classes[calleeClass]) {
                                    // Check each method node in that class
                                    for (const methodNode of classes[calleeClass]) {
                                        if (methodNode.kind === 'constructor') {
                                            count = true;
                                            calleeFilepath = filePath;
                                            break;
                                        }
                                        calleeMethodIndex++;
                                    }
                                    break;
                                }
                            }

                            let callerMethodIndex = 0;

                            if (callerMethod === 'constructor') {
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    if (methodNode.kind === 'constructor') {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }
                            } else {
                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }
                            }

                            if (callerMethod === 'constructor') callerMethod = '_constructor'

                            if (count) {
                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                }

                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                }

                                if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                }

                                state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                }

                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                }

                                if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                }

                                state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                            }
                        },
                        CallExpression(deepPath) {
                            /* Example:
                            ClassF.foo()
                            myCar.start(); (Constant/Variable instance call)
                            */
                            if (deepPath.node.callee.type === 'MemberExpression' &&
                                deepPath.node.callee.object.type === 'Identifier' &&
                                deepPath.node.callee.property.type === 'Identifier'
                            ) {
                                let callerMethod = innerPath.node.key.name;
                                let calleeClass = state.dependencies['instance-mapper'][state.currentFile][callerClass][deepPath.node.callee.object.name];

                                if (calleeClass === undefined) {
                                    calleeClass = deepPath.node.callee.object.name;
                                }

                                let calleeMethod = deepPath.node.callee.property.name;

                                let count = false;
                                let calleeMethodIndex = 0;
                                let calleeFilepath = '';

                                for (const [filePath, classes] of Object.entries(state.result)) {
                                    // If the target class exists in this file
                                    if (classes[calleeClass]) {
                                        // Check each method node in that class
                                        for (const methodNode of classes[calleeClass]) {
                                            const possibleCalleeMethod = methodNode.key && methodNode.key.name;
                                            if (calleeMethod === possibleCalleeMethod) {
                                                count = true;
                                                calleeFilepath = filePath;
                                                break;
                                            }
                                            calleeMethodIndex++;
                                        }
                                        break;
                                    }
                                }

                                let callerMethodIndex = 0;

                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }

                                if (calleeMethod === 'constructor') calleeMethod = '_constructor'
                                if (callerMethod === 'constructor') callerMethod = '_constructor'

                                if (count) {
                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                    }

                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                    }

                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                                }

                                return;
                            }

                            /* Example:
                            this.car.start()

                            This case counts property instances
                            */
                            if (deepPath.node.callee.type === 'MemberExpression' &&
                                deepPath.node.callee.property.type === 'Identifier' &&
                                deepPath.node.callee.object.type === 'MemberExpression' &&
                                deepPath.node.callee.object.object.type === 'ThisExpression'
                            ) {
                                let callerMethod = innerPath.node.key.name;
                                const calleeClass = state.dependencies['instance-mapper'][state.currentFile][callerClass][`this.${deepPath.node.callee.object.property.name}`];
                                let calleeMethod = deepPath.node.callee.property.name;

                                let count = false;
                                let calleeMethodIndex = 0;
                                let calleeFilepath = '';

                                for (const [filePath, classes] of Object.entries(state.result)) {
                                    // If the target class exists in this file
                                    if (classes[calleeClass]) {
                                        // Check each method node in that class
                                        for (const methodNode of classes[calleeClass]) {
                                            const possibleCalleeMethod = methodNode.key && methodNode.key.name;
                                            if (calleeMethod === possibleCalleeMethod) {
                                                count = true;
                                                calleeFilepath = filePath;
                                                break;
                                            }
                                            calleeMethodIndex++;
                                        }
                                        break;
                                    }
                                }

                                let callerMethodIndex = 0;

                                // Search method node
                                for (const methodNode of state.result[state.currentFile][callerClass]) {
                                    const possibleCallerMethod = methodNode.key && methodNode.key.name;
                                    if (callerMethod === possibleCallerMethod) {
                                        break;
                                    }
                                    callerMethodIndex++;
                                }

                                if (calleeMethod === 'constructor') calleeMethod = '_constructor'
                                if (callerMethod === 'constructor') callerMethod = '_constructor'

                                if (count) {
                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out']) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'] = {};
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass] = {}
                                    }

                                    if (!state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]) {
                                        state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod] = 0;
                                    }

                                    state.result[state.currentFile][callerClass][callerMethodIndex]['fan-out'][calleeClass][calleeMethod]++;


                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in']) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'] = {};
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass] = {}
                                    }

                                    if (!state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]) {
                                        state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod] = 0;
                                    }

                                    state.result[calleeFilepath][calleeClass][calleeMethodIndex]['fan-in'][callerClass][callerMethod]++;
                                }
                            }
                        }
                    })
                },
            })
        }
    }
};


function postProcessing(state){
    if (state.currentFile) delete state.currentFile;
    if (state.dependencies) delete state.dependencies;

    state.status = true;
}

export { state, visitors, postProcessing };
