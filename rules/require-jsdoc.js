export default {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Require a JSDoc block comment for every named function, exported function, class method, and object method',
        },
        schema: [],
        messages: {
            missing: 'Missing JSDoc comment.',
            missingParams: 'JSDoc is missing @param tags — document all {{count}} parameter(s).',
            missingReturns: 'JSDoc is missing @returns.',
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;

        function getJsdocBefore(node) {
            const comments = sourceCode.getCommentsBefore(node);

            if (! comments.length)
                return null;

            const last = comments.at(-1);

            return (last.type === 'Block' && last.value.startsWith('*')) ? last : null;
        }

        function countJsdocTags(comment, tag) {
            const matches = comment.value.match(new RegExp(`@${tag}\\b`, 'g'));

            return matches ? matches.length : 0;
        }

        function hasReturnValue(node) {
            function walk(n) {
                if (! n || typeof n !== 'object') return false;
                if (n.type === 'ReturnStatement') return n.argument !== null;
                if (n !== node && (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression')) return false;

                for (const key of Object.keys(n)) {
                    if (key === 'parent') continue;

                    const child = n[key];

                    if (Array.isArray(child)) { for (const item of child) { if (walk(item)) return true; } }
                    else if (child && typeof child === 'object' && child.type) { if (walk(child)) return true; }
                }

                return false;
            }

            return node.body && node.body.type === 'BlockStatement' && walk(node.body);
        }

        function isNested(node) {
            let p = node.parent;

            while (p) {
                if (p.type === 'Program') return false;
                if (p.type === 'ExportDefaultDeclaration' || p.type === 'ExportNamedDeclaration') return false;
                if (p.type === 'FunctionDeclaration' || p.type === 'FunctionExpression' || p.type === 'ArrowFunctionExpression') return true;
                p = p.parent;
            }

            return false;
        }

        function getDocSubject(node) {
            // Single-expression arrow: contract is fully visible in the expression itself.
            if (node.type === 'ArrowFunctionExpression' && node.body.type !== 'BlockStatement')
                return null;

            // Nested function: implementation detail, not a public API.
            if (isNested(node))
                return null;

            if (node.type === 'FunctionDeclaration') {
                // Comments before `export default function ...` attach to the ExportDefaultDeclaration.
                if (node.parent?.type === 'ExportDefaultDeclaration'
                    || node.parent?.type === 'ExportNamedDeclaration')
                    return node.parent;

                return node;
            }

            const parent = node.parent;

            if (parent.type === 'VariableDeclarator') {
                const decl = parent.parent;

                // `const a = () => {}, b = () => {};` — JSDoc placement is ambiguous. Skip.
                if (decl.declarations.length > 1)
                    return null;

                if (decl.parent.type === 'ExportNamedDeclaration')
                    return decl.parent;

                return decl;
            }

            if (parent.type === 'ExportDefaultDeclaration')
                return parent;

            if (parent.type === 'MethodDefinition' || parent.type === 'Property')
                return parent;

            return null;
        }

        function check(node) {
            const subject = getDocSubject(node);

            if (! subject)
                return;

            const jsdoc = getJsdocBefore(subject);

            if (! jsdoc) {
                context.report({ node: subject, messageId: 'missing' });
                return;
            }

            const paramCount = node.params.length;

            if (paramCount > 0 && countJsdocTags(jsdoc, 'param') < paramCount)
                context.report({ node: subject, messageId: 'missingParams', data: { count: paramCount } });

            if (hasReturnValue(node) && countJsdocTags(jsdoc, 'returns') === 0 && countJsdocTags(jsdoc, 'return') === 0)
                context.report({ node: subject, messageId: 'missingReturns' });
        }

        return {
            FunctionDeclaration: check,
            FunctionExpression: check,
            ArrowFunctionExpression: check,
        };
    },
};
