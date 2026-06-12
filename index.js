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

const plugin = { rules };

const recommended = {
    plugins: { 'yt-lint': plugin },
    rules: Object.fromEntries(
        Object.keys(rules).map(name => [ `yt-lint/${name}`, 'warn' ])
    ),
};

export default { rules, configs: { recommended } };
