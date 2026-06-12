import rule from '../rules/no-process-exit-outside-cli.js';
import { ruleTester } from './helpers.js';


ruleTester.run('no-process-exit-outside-cli', rule, {
    valid: [
        // Not process.exit.
        'foo.exit(1);',
        // Reading exitCode, not calling exit.
        'process.exitCode = 1;',
        // Permitted in a file matching allowedProcessExitGlobs.
        {
            code: 'process.exit(1);',
            filename: 'packages/cli/index.js',
            options: [ { allowedProcessExitGlobs: [ 'packages/cli/**' ] } ],
        },
    ],
    invalid: [
        {
            code: 'process.exit(1);',
            errors: [ { messageId: 'unexpected' } ],
        },
        {
            // Glob configured but this file does not match it.
            code: 'process.exit(0);',
            filename: 'src/server.js',
            options: [ { allowedProcessExitGlobs: [ 'packages/cli/**' ] } ],
            errors: [ { messageId: 'unexpected' } ],
        },
    ],
});
