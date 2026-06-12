import rule from '../rules/no-relative-cross-package-imports.js';
import { ruleTester } from './helpers.js';


ruleTester.run('no-relative-cross-package-imports', rule, {
    valid: [
        // File outside any package — rule is inert.
        { code: "import x from '../other/util.js';", filename: 'src/index.js' },
        // Relative import staying within the same package.
        { code: "import x from './util.js';", filename: 'packages/a/src/index.js' },
        // Bare/aliased imports are not relative — ignored.
        { code: "import x from 'lodash';", filename: 'packages/a/src/index.js' },
    ],
    invalid: [
        {
            // Relative import climbing into package "b" from package "a".
            code: "import x from '../../b/src/util.js';",
            filename: 'packages/a/src/index.js',
            errors: [ { messageId: 'unexpected' } ],
        },
        {
            // Dynamic import across package boundary.
            code: "const x = import('../../b/src/util.js');",
            filename: 'packages/a/src/index.js',
            errors: [ { messageId: 'unexpected' } ],
        },
        {
            // Custom packageRootPattern.
            code: "import x from '../../b/index.js';",
            filename: 'modules/a/index.js',
            options: [ { packageRootPattern: 'modules/*' } ],
            errors: [ { messageId: 'unexpected' } ],
        },
    ],
});
