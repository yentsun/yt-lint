import { RuleTester } from 'eslint';
import { describe, it } from 'node:test';


// ESLint's RuleTester emits its cases through global describe/it hooks.
// Wire them to node:test so `node --test` discovers and runs them.
RuleTester.describe = describe;
RuleTester.it = it;

// Flat-config RuleTester. ESLint 9 defaults to the latest ecmaVersion and
// module source type via languageOptions; spell it out so test files don't repeat it.
export function makeRuleTester(languageOptions = {}) {
    return new RuleTester({
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            ...languageOptions,
        },
    });
}

export const ruleTester = makeRuleTester();
