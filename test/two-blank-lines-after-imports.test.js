import rule from '../rules/two-blank-lines-after-imports.js';
import { ruleTester } from './helpers.js';


ruleTester.run('two-blank-lines-after-imports', rule, {
    valid: [
        // Exactly two blank lines between the import block and first statement.
        "import a from 'a';\n\n\nconst x = 1;",
        // No imports at all — nothing to space.
        'const x = 1;',
        // File is entirely imports — no following content to separate.
        "import a from 'a';\nimport b from 'b';",
    ],
    invalid: [
        {
            // No blank lines.
            code: "import a from 'a';\nconst x = 1;",
            output: "import a from 'a';\n\n\nconst x = 1;",
            errors: [ { messageId: 'expected' } ],
        },
        {
            // One blank line.
            code: "import a from 'a';\n\nconst x = 1;",
            output: "import a from 'a';\n\n\nconst x = 1;",
            errors: [ { messageId: 'expected' } ],
        },
        {
            // Three blank lines — too many.
            code: "import a from 'a';\n\n\n\nconst x = 1;",
            output: "import a from 'a';\n\n\nconst x = 1;",
            errors: [ { messageId: 'expected' } ],
        },
    ],
});
