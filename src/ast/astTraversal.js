import traverse from "@babel/traverse";
import { getASTs } from "./astProcessor.js";
import { MESSAGES } from "../constants/constants.js";

/**
 * Traverses the ASTs of all files and applies the provided visitors.
 * It collects the results for each file and handles any errors that may occur
 * during AST traversal or fetching the ASTs.
 *
 * @param {Object} visitors - The visitors object containing Babel traversal methods.
 * @returns {Array} - An array of results, each containing the file name and its respective traversal results.
 */
function traverseASTs(visitors) {
    try {
        // Get all ASTs (synchronously)
        const ASTs = getASTs();
        return ASTs.map(({ fileName, ast }) => {
            try {
                // Create a context for each file containing its name and an empty results array
                const context = { fileName, results: [] };

                // Traverse the AST with the provided visitors
                traverse.default(ast, visitors, null, context);

                // Return the context containing fileName and traversal results
                return context;
            } catch (err) {
                // Error handling in case Babel's traverse fails for a specific AST
                console.error(`${MESSAGES.ERRORS.ERROR_TRAVERSING_AST} ${fileName}:`, err);

                // Return an error object with the file name and error message
                return { fileName, error: `${MESSAGES.ERRORS.ERROR_TRAVERSING_AST_MESSAGE} ${err.message}` };
            }
        });
    } catch (err) {
        // Error handling in case getAllASTs fails to retrieve the ASTs
        console.error(MESSAGES.ERRORS.ERROR_FETCHING_ASTS, err);

        // Throw a new error to signal failure in fetching ASTs
        throw new Error(MESSAGES.ERRORS.FAILED_FETCHING_ASTS);
    }
}

export { traverseASTs };
