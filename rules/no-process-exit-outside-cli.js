import { normalizeFilename, matchesAnyGlob } from '../utils/paths.js';


export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow process.exit outside designated CLI files',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allowedProcessExitGlobs: { type: 'array', items: { type: 'string' } },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpected: 'Use thrown errors or returned failures instead of process.exit. Configure allowedProcessExitGlobs to permit it in CLI entry points.',
        },
    },
    create(context) {
        const { allowedProcessExitGlobs = [] } = context.options[0] ?? {};
        const filename = normalizeFilename(context.filename ?? '');

        if (allowedProcessExitGlobs.length && matchesAnyGlob(filename, allowedProcessExitGlobs))
            return {};

        return {
            CallExpression(node) {
                if (node.callee.type !== 'MemberExpression' || node.callee.computed)
                    return;

                if (node.callee.object.type !== 'Identifier' || node.callee.object.name !== 'process')
                    return;

                if (node.callee.property.type !== 'Identifier' || node.callee.property.name !== 'exit')
                    return;

                context.report({ node, messageId: 'unexpected' });
            },
        };
    },
};
