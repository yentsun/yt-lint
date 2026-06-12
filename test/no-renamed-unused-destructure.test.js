import rule from '../rules/no-renamed-unused-destructure.js';
import { ruleTester } from './helpers.js';


ruleTester.run('no-renamed-unused-destructure', rule, {
    valid: [
        // Plain shorthand destructure.
        'const { a } = obj;',
        // Rename to a non-underscore name.
        'const { a: b } = obj;',
        // Both sides underscore-prefixed — intentional (e.g. _id convention).
        'const { _id: _x } = obj;',
        // Renaming to a name that merely contains an underscore later is fine.
        'const { a: b_c } = obj;',
    ],
    invalid: [
        {
            code: 'const { id: _id } = obj;',
            errors: [ { messageId: 'unexpected', data: { key: 'id', value: '_id' } } ],
        },
        {
            // String-literal key.
            code: "const { 'name': _name } = obj;",
            errors: [ { messageId: 'unexpected', data: { key: 'name', value: '_name' } } ],
        },
    ],
});
