import rule from '../rules/no-nodejs-builtins-in-webapp.js';
import { ruleTester } from './helpers.js';


ruleTester.run('no-nodejs-builtins-in-webapp', rule, {
    valid: [
        // Opt-in: without browserCodeGlobs the rule is silent.
        { code: "import fs from 'fs';", filename: 'src/webapp/app.js' },
        // File does not match the configured browser globs.
        {
            code: "import fs from 'fs';",
            filename: 'src/server/app.js',
            options: [ { browserCodeGlobs: [ 'src/webapp/**' ] } ],
        },
        // Browser file importing a non-builtin package.
        {
            code: "import x from 'lodash';",
            filename: 'src/webapp/app.js',
            options: [ { browserCodeGlobs: [ 'src/webapp/**' ] } ],
        },
    ],
    invalid: [
        {
            code: "import fs from 'fs';",
            filename: 'src/webapp/app.js',
            options: [ { browserCodeGlobs: [ 'src/webapp/**' ] } ],
            errors: [ { messageId: 'unexpected', data: { moduleName: 'fs' } } ],
        },
        {
            // node: prefix form.
            code: "import { readFile } from 'node:fs';",
            filename: 'src/webapp/app.js',
            options: [ { browserCodeGlobs: [ 'src/webapp/**' ] } ],
            errors: [ { messageId: 'unexpected', data: { moduleName: 'node:fs' } } ],
        },
        {
            // CommonJS require.
            code: "const path = require('path');",
            filename: 'src/webapp/app.js',
            options: [ { browserCodeGlobs: [ 'src/webapp/**' ] } ],
            errors: [ { messageId: 'unexpected', data: { moduleName: 'path' } } ],
        },
    ],
});
