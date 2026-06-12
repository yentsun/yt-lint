import rule from '../rules/no-blank-lines-between-declarations.js';
import { ruleTester } from './helpers.js';


ruleTester.run('no-blank-lines-between-declarations', rule, {
    valid: [
        // Adjacent same-step declarations with no blank line.
        'const a = 1;\nconst b = 2;',
        // A comment between them is a deliberate separator — leave it.
        'const a = 1;\n\n// note\nconst b = 2;',
        // Different preparation steps (free vs sync-call) are separated on purpose.
        'const a = 1;\n\nconst b = foo();',
        // Non-declaration statement between them — rule only targets back-to-back decls.
        'const a = 1;\n\nfoo();\nconst b = 2;',
    ],
    invalid: [
        {
            code: 'const a = 1;\n\nconst b = 2;',
            output: 'const a = 1;\nconst b = 2;',
            errors: [ { messageId: 'unexpected' } ],
        },
        {
            // Inside a block.
            code: 'function f() {\n    const a = 1;\n\n    const b = 2;\n}',
            output: 'function f() {\n    const a = 1;\n    const b = 2;\n}',
            errors: [ { messageId: 'unexpected' } ],
        },
    ],
});
