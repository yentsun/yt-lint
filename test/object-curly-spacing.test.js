import rule from '../rules/object-curly-spacing.js';
import { ruleTester } from './helpers.js';


ruleTester.run('object-curly-spacing', rule, {
    valid: [
        // Spaced braces on object expressions and patterns.
        'const x = { a: 1 };',
        'const { a } = obj;',
        // Empty objects have no inner tokens — nothing to space.
        'const x = {};',
        // Nested closing braces sit flush: `}}` with no space.
        'const x = { a: { b: 1 }};',
        // Multiline objects only constrain the same-line edges.
        'const x = {\n    a: 1,\n};',
    ],
    invalid: [
        {
            code: 'const x = {a: 1 };',
            output: 'const x = { a: 1 };',
            errors: [ { messageId: 'expectedSpaceAfterOpening' } ],
        },
        {
            code: 'const x = { a: 1};',
            output: 'const x = { a: 1 };',
            errors: [ { messageId: 'expectedSpaceBeforeClosing' } ],
        },
        {
            code: 'const x = {a: 1};',
            output: 'const x = { a: 1 };',
            errors: [
                { messageId: 'expectedSpaceAfterOpening' },
                { messageId: 'expectedSpaceBeforeClosing' },
            ],
        },
        {
            // Extra space before a nested closing brace must be removed.
            code: 'const x = { a: { b: 1 } };',
            output: 'const x = { a: { b: 1 }};',
            errors: [ { messageId: 'unexpectedSpaceBeforeNestedClosing' } ],
        },
        {
            code: 'const { a} = obj;',
            output: 'const { a } = obj;',
            errors: [ { messageId: 'expectedSpaceBeforeClosing' } ],
        },
    ],
});
