import rule from '../rules/blank-line-after-if.js';
import { ruleTester } from './helpers.js';


ruleTester.run('blank-line-after-if', rule, {
    valid: [
        // Blank line after the if block before the next statement.
        'if (x) {\n    y();\n}\n\nz();',
        // Single-line crammed pattern — if ends on the same line as the next statement.
        'function f() { if (v) return 1; return 2; }',
        // if is the last statement — nothing follows.
        'if (x) {\n    y();\n}',
    ],
    invalid: [
        {
            code: 'if (x) {\n    y();\n}\nz();',
            output: 'if (x) {\n    y();\n}\n\nz();',
            errors: [ { messageId: 'expected' } ],
        },
        {
            // Inside a function block.
            code: 'function f() {\n    if (x) {\n        y();\n    }\n    z();\n}',
            output: 'function f() {\n    if (x) {\n        y();\n    }\n\n    z();\n}',
            errors: [ { messageId: 'expected' } ],
        },
    ],
});
