import { getLeadingImports, getImportEntries, getImportEnd, getStaticSource } from '../utils/imports.js';
import { getLinebreak } from '../utils/ast.js';
import { isNodeBuiltinSource, isRelativeSource } from '../utils/paths.js';


function makeIsInternalAlias(aliases) {
    return source => aliases.some(a => source === a || source.startsWith(`${a}/`));
}

function getImportOrderKey(source, isInternalAlias) {
    if (isNodeBuiltinSource(source))
        return [ 0, source ];

    if (! isRelativeSource(source) && ! isInternalAlias(source))
        return [ 1, source ];

    if (isInternalAlias(source))
        return [ 2, source ];

    return [ 3, source ];
}

function compareImportSources(leftSource, rightSource, isInternalAlias) {
    const leftKey = getImportOrderKey(leftSource, isInternalAlias);
    const rightKey = getImportOrderKey(rightSource, isInternalAlias);
    const length = Math.max(leftKey.length, rightKey.length);

    for (let index = 0; index < length; index += 1) {
        const leftValue = leftKey[index];
        const rightValue = rightKey[index];

        if (leftValue === rightValue)
            continue;

        if (leftValue === undefined)
            return -1;

        if (rightValue === undefined)
            return 1;

        return leftValue < rightValue ? -1 : 1;
    }

    return 0;
}

export default {
    meta: {
        type: 'suggestion',
        fixable: 'code',
        docs: {
            description: 'Require imports to be ordered from general to specific, with alphabetical fallback inside each bucket',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    internalAliases: { type: 'array', items: { type: 'string' } },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpected: 'Import "{{currentSource}}" should come after "{{previousSource}}" to keep imports ordered from general to specific, then alphabetically.',
        },
    },
    create(context) {
        const { internalAliases = [] } = context.options[0] ?? {};
        const isInternalAlias = makeIsInternalAlias(internalAliases);
        const sourceCode = context.sourceCode;

        return {
            Program(program) {
                const imports = getLeadingImports(program);

                if (imports.length < 2)
                    return;

                // Side-effect imports (CSS, polyfills) carry init-order semantics; reordering them is unsafe.
                if (imports.some(importNode => importNode.specifiers.length === 0))
                    return;

                const firstImport = imports[0];
                const lastImport = imports.at(-1);
                const importEntries = getImportEntries(sourceCode, imports);
                let previousImport = null;
                let previousSource = null;

                for (const currentImport of imports) {
                    const currentSource = getStaticSource(currentImport);

                    if (! currentSource)
                        continue;

                    if (previousImport && compareImportSources(previousSource, currentSource, isInternalAlias) > 0) {
                        context.report({
                            node: currentImport.source,
                            messageId: 'unexpected',
                            data: { currentSource, previousSource },
                            fix: fixer => {
                                const sortedImports = importEntries
                                    .toSorted((l, r) => compareImportSources(l.source, r.source, isInternalAlias))
                                    .map(entry => entry.text)
                                    .join(getLinebreak(sourceCode.text));

                                return fixer.replaceTextRange(
                                    [ firstImport.range[0], getImportEnd(sourceCode, lastImport, null) ],
                                    sortedImports
                                );
                            },
                        });

                        return;
                    }

                    previousImport = currentImport;
                    previousSource = currentSource;
                }
            },
        };
    },
};
