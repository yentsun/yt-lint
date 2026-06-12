import rule from '../rules/no-unused.js';
import { ruleTester } from './helpers.js';


ruleTester.run('no-unused', rule, {
    valid: [
        // Used import.
        "import a from 'a';\na();",
        // Caught error is used.
        'try { x(); } catch (e) { log(e); }',
        // Underscore-prefixed destructured binding is intentionally ignored.
        'const { a, _b } = obj;\nuse(a);',
        // Rest sibling present — omitting a key would change `...rest`, so keep it.
        'const { x, ...rest } = obj;\nuse(rest);',
        // React default import is exempt (used implicitly by JSX elsewhere).
        "import React from 'react';",
    ],
    invalid: [
        {
            // One of two named imports is unused.
            code: "import { a, b } from 'a';\na();",
            output: "import { a } from 'a';\na();",
            errors: [ { messageId: 'unused', data: { name: 'b' } } ],
        },
        {
            // Unused destructured property is stripped.
            code: 'const { a, b } = obj;\nuse(a);',
            output: 'const { a } = obj;\nuse(a);',
            errors: [ { messageId: 'unused', data: { name: 'b' } } ],
        },
        {
            // Unused caught error → bare catch.
            code: 'try { x(); } catch (e) {}',
            output: 'try { x(); } catch {}',
            errors: [ { messageId: 'unused', data: { name: 'e' } } ],
        },
    ],
});
