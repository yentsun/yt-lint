export default {
    meta: {
        type: 'problem',
        fixable: 'code',
        docs: {
            description: 'Report and autofix unused imports, destructured properties, and caught errors',
        },
        schema: [],
        messages: {
            unused: '`{{name}}` is declared but never used.',
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;
        const IGNORE_PATTERN = /^_/;
        const REACT_IGNORE = /^React$/;

        function isReferenced(variable) {
            // `react/jsx-uses-vars` marks JSX-only references via context.markVariableAsUsed(),
            // which sets `eslintUsed`. Honor it so component imports used only as `<Foo />` aren't stripped.
            if (variable.eslintUsed)
                return true;

            return variable.references.some(ref => ref.identifier !== variable.defs[0].name);
        }

        function specifierText(spec) {
            if (spec.type === 'ImportDefaultSpecifier')
                return spec.local.name;

            if (spec.type === 'ImportNamespaceSpecifier')
                return `* as ${spec.local.name}`;

            if (spec.imported.name === spec.local.name)
                return spec.local.name;

            return `${spec.imported.name} as ${spec.local.name}`;
        }

        function buildWithClause(importDecl) {
            if (! importDecl.attributes?.length)
                return '';

            const attrs = importDecl.attributes
                .map(attr => `${attr.key.type === 'Identifier' ? attr.key.name : attr.key.raw}: ${attr.value.raw}`)
                .join(', ');

            return ` with { ${attrs} }`;
        }

        function rewriteImport(fixer, importDecl, removed) {
            const kept = importDecl.specifiers.filter(s => ! removed.includes(s));
            const withClause = buildWithClause(importDecl);

            if (! kept.length)
                return fixer.replaceText(importDecl, `import ${importDecl.source.raw}${withClause};`);

            const defaultSpec = kept.find(s => s.type === 'ImportDefaultSpecifier');
            const namespaceSpec = kept.find(s => s.type === 'ImportNamespaceSpecifier');
            const namedSpecs = kept.filter(s => s.type === 'ImportSpecifier');
            const parts = [];

            if (defaultSpec)
                parts.push(specifierText(defaultSpec));

            if (namespaceSpec)
                parts.push(specifierText(namespaceSpec));

            if (namedSpecs.length)
                parts.push(`{ ${namedSpecs.map(specifierText).join(', ')} }`);

            return fixer.replaceText(importDecl, `import ${parts.join(', ')} from ${importDecl.source.raw}${withClause};`);
        }

        function getDestructuredFix(property) {
            const objectPattern = property.parent;

            return function fix(fixer) {
                const properties = objectPattern.properties.filter(p => p.type === 'Property');
                const index = properties.indexOf(property);
                // Don't strip past a rest element — `const { a, b, ...rest } = x`
                // removing `b` leaves `const { a, ...rest } = x` (still legal).
                const hasRest = objectPattern.properties.some(p => p.type === 'RestElement');

                if (! hasRest && properties.length === 1)
                    return null;

                if (index < properties.length - 1)
                    return fixer.removeRange([ property.range[0], properties[index + 1].range[0] ]);

                if (index === 0)
                    return fixer.remove(property);

                return fixer.removeRange([ properties[index - 1].range[1], property.range[1] ]);
            };
        }

        function getCatchFix(catchClause) {
            return function fix(fixer) {
                // Destructured catch params need pattern rewriting — decline to autofix.
                if (catchClause.param.type === 'ObjectPattern' || catchClause.param.type === 'ArrayPattern')
                    return null;

                // `catch (e) { ... }` → `catch { ... }`
                const openParen = sourceCode.getTokenAfter(
                    sourceCode.getFirstToken(catchClause),
                    token => token.value === '('
                );

                if (! openParen) return null;

                const closeParen = sourceCode.getTokenAfter(catchClause.param, token => token.value === ')');

                if (! closeParen) return null;

                return fixer.removeRange([ openParen.range[0], catchClause.body.range[0] ]);
            };
        }

        function checkVariable(variable) {
            if (! variable.defs.length || isReferenced(variable))
                return;

            const def = variable.defs[0];
            const name = variable.name;

            if (IGNORE_PATTERN.test(name))
                return;

            if (REACT_IGNORE.test(name))
                return;

            // Imports are handled in bulk per declaration — see reportUnusedImports.
            if (def.type === 'ImportBinding')
                return;

            if (def.type === 'CatchClause') {
                const catchClause = def.node;

                context.report({
                    node: catchClause.param,
                    messageId: 'unused',
                    data: { name },
                    fix: getCatchFix(catchClause),
                });

                return;
            }

            // Destructured object property: `const { x } = obj` where x is unused.
            if (def.node?.type === 'VariableDeclarator' && def.name?.parent?.type === 'Property') {
                const property = def.name.parent;

                // Honor ignoreRestSiblings semantics: when the pattern has a rest element,
                // leaving the property in is intentional (it omits the key from `...rest`).
                if (property.parent.properties.some(p => p.type === 'RestElement'))
                    return;

                context.report({
                    node: def.name,
                    messageId: 'unused',
                    data: { name },
                    fix: getDestructuredFix(property),
                });
            }
        }

        function walkScope(scope) {
            for (const variable of scope.variables)
                checkVariable(variable);

            for (const childScope of scope.childScopes)
                walkScope(childScope);
        }

        function reportUnusedImports(program) {
            const programScope = sourceCode.getScope(program);
            // For ES modules `getScope(Program)` returns the global scope —
            // import bindings live in its `module` child scope.
            const moduleScope = programScope.childScopes.find(s => s.type === 'module') || programScope;
            const unusedByDecl = new Map();

            for (const variable of moduleScope.variables) {
                if (! variable.defs.length || isReferenced(variable))
                    continue;

                const def = variable.defs[0];

                if (def.type !== 'ImportBinding')
                    continue;

                if (REACT_IGNORE.test(variable.name))
                    continue;

                const specifier = def.node;
                const importDecl = specifier.parent;
                const entries = unusedByDecl.get(importDecl) ?? [];

                entries.push(specifier);
                unusedByDecl.set(importDecl, entries);
            }

            for (const [ importDecl, unusedSpecs ] of unusedByDecl) {
                unusedSpecs.forEach((specifier, indexInUnused) => {
                    context.report({
                        node: specifier,
                        messageId: 'unused',
                        data: { name: specifier.local.name },
                        // Only the first report per declaration emits a fix — the rewrite removes all
                        // unused specifiers at once and subsequent fixes would conflict on the same range.
                        fix: indexInUnused === 0
                            ? fixer => rewriteImport(fixer, importDecl, unusedSpecs)
                            : null,
                    });
                });
            }
        }

        return {
            'Program:exit'(program) {
                reportUnusedImports(program);
                walkScope(sourceCode.getScope(program));
            },
        };
    },
};
