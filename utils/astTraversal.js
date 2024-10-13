import traverse from "@babel/traverse";
import { getAllASTs } from "./astProcessor.js";

function traverseASTsFan(visitors) {
    const ASTs = getAllASTs();
    const results = [];

    ASTs.forEach(({ fileName, ast }) => {
        const context = { fileName, results: [] };
        traverse.default(ast, visitors, null, context);
        results.push(context);
    });

    return results;
}

export { traverseASTsFan };