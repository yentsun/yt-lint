import { createRequire } from 'node:module';

import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

import importGeneralToSpecific from './rules/import-general-to-specific.js';
import objectCurlySpacing from './rules/object-curly-spacing.js';
import twoBlankLinesAfterImports from './rules/two-blank-lines-after-imports.js';
import noBlankLinesBetweenDeclarations from './rules/no-blank-lines-between-declarations.js';
import blankLineAfterIf from './rules/blank-line-after-if.js';
import blankLineAfterUnpacking from './rules/blank-line-after-unpacking.js';
import requireJsdoc from './rules/require-jsdoc.js';
import noUnused from './rules/no-unused.js';
import noRenamedUnusedDestructure from './rules/no-renamed-unused-destructure.js';
import noProcessExitOutsideCli from './rules/no-process-exit-outside-cli.js';
import noRelativeCrossPackageImports from './rules/no-relative-cross-package-imports.js';
import noNodejsBuiltinsInWebapp from './rules/no-nodejs-builtins-in-webapp.js';


const rules = {
    'import-general-to-specific': importGeneralToSpecific,
    'object-curly-spacing': objectCurlySpacing,
    'two-blank-lines-after-imports': twoBlankLinesAfterImports,
    'no-blank-lines-between-declarations': noBlankLinesBetweenDeclarations,
    'blank-line-after-if': blankLineAfterIf,
    'blank-line-after-unpacking': blankLineAfterUnpacking,
    'require-jsdoc': requireJsdoc,
    'no-unused': noUnused,
    'no-renamed-unused-destructure': noRenamedUnusedDestructure,
    'no-process-exit-outside-cli': noProcessExitOutsideCli,
    'no-relative-cross-package-imports': noRelativeCrossPackageImports,
    'no-nodejs-builtins-in-webapp': noNodejsBuiltinsInWebapp,
};

const pkg = createRequire(import.meta.url)('./package.json');
const meta = { name: pkg.name, version: pkg.version };

const plugin = { meta, rules };

const BUILTIN_RULES = {
    'indent': [ 'error', 4, { SwitchCase: 1 } ],
    'quotes': [ 'error', 'single', { avoidEscape: true } ],
    'jsx-quotes': [ 'error', 'prefer-double' ],
    'eqeqeq': [ 'error', 'smart' ],
    'array-bracket-spacing': [ 'error', 'always' ],
    'no-tabs': 'error',
    'no-debugger': 'error',
    'no-empty-pattern': 'error',
    'no-implied-eval': 'error',
    'no-new-wrappers': 'error',
    'no-object-constructor': 'error',
    'no-promise-executor-return': 'error',
    'no-self-compare': 'error',
    'no-template-curly-in-string': 'error',
    'no-throw-literal': 'error',
    'no-unreachable-loop': 'error',
    'no-constant-binary-expression': 'error',
    'no-undef': 'error',
    'use-isnan': 'error',
    'valid-typeof': 'error',
    'array-callback-return': 'error',
    'default-case-last': 'error',
    'prefer-object-has-own': 'error',
    'no-unused-vars': [ 'error', {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^React$',
    } ],
};

const CUSTOM_RULES = Object.fromEntries(
    Object.keys(rules).map(name => [ `yt-lint/${name}`, 'error' ])
);

const recommended = {
    plugins: { 'yt-lint': plugin },
    rules: {
        ...BUILTIN_RULES,
        ...CUSTOM_RULES,
    },
};

const react = [
    recommended,
    {
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            'react/display-name': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
            'react/jsx-uses-vars': 'error',
            'react/no-multi-comp': 'error',
            'react/jsx-no-useless-fragment': 'error',
            'react/jsx-curly-spacing': [ 'error', { when: 'always', children: true } ],
            'react/self-closing-comp': 'error',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error',
        },
    },
];

export default { meta, rules, configs: { recommended, react } };
