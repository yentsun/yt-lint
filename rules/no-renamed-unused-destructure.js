export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow destructuring renames to underscore-prefixed names; omit the property instead',
        },
        schema: [],
        messages: {
            unexpected: 'Do not destructure "{{key}}" as "{{value}}". Omit "{{key}}" from the pattern instead of renaming it to mark unused.',
        },
    },
    create(context) {
        return {
            Property(node) {
                if (node.parent?.type !== 'ObjectPattern')
                    return;

                if (node.shorthand)
                    return;

                if (node.value.type !== 'Identifier')
                    return;

                if (! node.value.name.startsWith('_'))
                    return;

                const keyName = node.key.name ?? node.key.value;

                // Renames between two underscore-prefixed names are intentional (e.g. ObjectId convention).
                if (typeof keyName === 'string' && keyName.startsWith('_'))
                    return;

                context.report({
                    node,
                    messageId: 'unexpected',
                    data: {
                        key: keyName,
                        value: node.value.name,
                    },
                });
            },
        };
    },
};
