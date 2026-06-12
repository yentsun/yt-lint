import { normalizeFilename, isNodeBuiltinSource, matchesAnyGlob } from '../utils/paths.js';
import { getStaticSource } from '../utils/imports.js';


export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow Node.js builtins in browser code',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    browserCodeGlobs: { type: 'array', items: { type: 'string' } },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpected: 'Do not import Node.js builtin "{{moduleName}}" in browser code.',
        },
    },
    create(context) {
        const { browserCodeGlobs = [] } = context.options[0] ?? {};
        const filename = normalizeFilename(context.filename ?? '');

        // Rule is opt-in: without browserCodeGlobs it has no defined scope and stays silent.
        if (! browserCodeGlobs.length || ! matchesAnyGlob(filename, browserCodeGlobs))
            return {};

        function report(reportNode, source) {
            if (! source || ! isNodeBuiltinSource(source))
                return;

            context.report({
                node: reportNode,
                messageId: 'unexpected',
                data: { moduleName: source },
            });
        }

        function check(node) {
            report(node.source, getStaticSource(node));
        }

        return {
            ImportDeclaration: check,
            ImportExpression: check,
            ExportNamedDeclaration: check,
            ExportAllDeclaration: check,
            CallExpression(node) {
                if (node.callee.type !== 'Identifier' || node.callee.name !== 'require')
                    return;

                const arg = node.arguments[0];

                if (arg?.type !== 'Literal' || typeof arg.value !== 'string')
                    return;

                report(arg, arg.value);
            },
        };
    },
};
