import rule from '../rules/import-general-to-specific.js';
import { ruleTester } from './helpers.js';


ruleTester.run('import-general-to-specific', rule, {
    valid: [
        // node builtin → third-party → relative.
        "import fs from 'node:fs';\nimport express from 'express';\nimport { x } from './local.js';",
        // Alphabetical within a bucket.
        "import a from 'aaa';\nimport b from 'bbb';",
        // Internal aliases sit between third-party and relative.
        {
            code: "import express from 'express';\nimport { x } from 'shared/util';\nimport { y } from './local.js';",
            options: [ { internalAliases: [ 'shared' ] } ],
        },
        // Single import — nothing to order.
        "import a from 'a';",
        // Side-effect import present — reordering would be unsafe, so the rule bails.
        "import './polyfill.js';\nimport { x } from './local.js';\nimport express from 'express';",
    ],
    invalid: [
        {
            // Relative before third-party.
            code: "import { x } from './local.js';\nimport express from 'express';",
            output: "import express from 'express';\nimport { x } from './local.js';",
            errors: [ { messageId: 'unexpected', data: { currentSource: 'express', previousSource: './local.js' } } ],
        },
        {
            // Out-of-order alphabetical within the third-party bucket.
            code: "import b from 'bbb';\nimport a from 'aaa';",
            output: "import a from 'aaa';\nimport b from 'bbb';",
            errors: [ { messageId: 'unexpected', data: { currentSource: 'aaa', previousSource: 'bbb' } } ],
        },
    ],
});
