import rule from '../rules/require-jsdoc.js';
import { ruleTester } from './helpers.js';


ruleTester.run('require-jsdoc', rule, {
    valid: [
        // Fully documented function: description, @param per arg, @returns.
        '/**\n * Add two numbers.\n * @param {number} a\n * @param {number} b\n * @returns {number}\n */\nfunction add(a, b) {\n    return a + b;\n}',
        // Single-expression arrow — contract is visible in the expression itself.
        'const f = () => 1;',
        // Documented class method.
        'class A {\n    /**\n     * Greet.\n     * @returns {string}\n     */\n    greet() {\n        return \'hi\';\n    }\n}',
        // Nested function is an implementation detail, not public API.
        '/**\n * Outer.\n * @returns {Function}\n */\nfunction outer() {\n    function inner() { return 1; }\n\n    return inner;\n}',
    ],
    invalid: [
        {
            code: 'function f() {}',
            errors: [ { messageId: 'missing' } ],
        },
        {
            // Has JSDoc but no @param tags.
            code: '/**\n * Thing.\n */\nfunction f(a) {}',
            errors: [ { messageId: 'missingParams', data: { count: 1 } } ],
        },
        {
            // Has JSDoc but missing @returns for a value-returning function.
            code: '/**\n * Thing.\n */\nfunction f() {\n    return 1;\n}',
            errors: [ { messageId: 'missingReturns' } ],
        },
        {
            // Class method without JSDoc.
            code: 'class A {\n    foo() {}\n}',
            errors: [ { messageId: 'missing' } ],
        },
    ],
});
