import rule from '../rules/blank-line-after-unpacking.js';
import { ruleTester } from './helpers.js';


ruleTester.run('blank-line-after-unpacking', rule, {
    valid: [
        // free → free (same step, no blank needed), blank before sync step, blank before work.
        'function f() {\n    const a = x;\n    const b = y;\n\n    const c = foo();\n\n    doWork();\n}',
        // Single declaration then work, separated by a blank line.
        'function f() {\n    const a = x;\n\n    doWork();\n}',
        // No work statement follows the preparation block.
        'function f() {\n    const a = x;\n    const b = y;\n}',
    ],
    invalid: [
        {
            // Missing blank line between free-extraction and sync-call steps.
            code: 'function f() {\n    const a = x;\n    const b = foo();\n\n    doWork();\n}',
            output: 'function f() {\n    const a = x;\n\n    const b = foo();\n\n    doWork();\n}',
            errors: [ {
                messageId: 'betweenSteps',
                data: { prevLabel: 'free-extraction', currLabel: 'sync-call' },
            } ],
        },
        {
            // Missing blank line before the first work statement.
            code: 'function f() {\n    const a = x;\n    const b = y;\n    doWork();\n}',
            output: 'function f() {\n    const a = x;\n    const b = y;\n\n    doWork();\n}',
            errors: [ { messageId: 'beforeWork' } ],
        },
    ],
});
