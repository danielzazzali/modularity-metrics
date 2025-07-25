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