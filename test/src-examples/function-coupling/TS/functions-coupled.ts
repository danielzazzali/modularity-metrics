// 1. Function Declaration
function functionA(): void {
    functionB()
}

// 2. Function Expression
const functionB = function (): void {
    functionC();
};

// 3. Arrow Function Expression
const functionC = (): void => {
    functionA();
};