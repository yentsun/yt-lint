import { normalizeFilename, makeGetPackageName, resolvePosix } from '../utils/paths.js';
import { getStaticSource, isImportLikeNode } from '../utils/imports.js';


export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow relative imports that climb into another package',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    packageRootPattern: { type: 'string' },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            unexpected: 'Use a package alias or package entry point instead of a relative import into another package.',
        },
    },
    create(context) {
        const { packageRootPattern = 'packages/*' } = context.options[0] ?? {};
        const getPackageName = makeGetPackageName(packageRootPattern);
        const filename = normalizeFilename(context.filename ?? '');
        const currentPackage = getPackageName(filename);

        if (! currentPackage)
            return {};

        const fileDir = filename.slice(0, filename.lastIndexOf('/'));

        function checkSource(reportNode, source) {
            if (! source?.startsWith('.'))
                return;

            const resolved = resolvePosix(fileDir, source);
            const targetPackage = getPackageName(resolved);

            if (targetPackage === currentPackage)
                return;

            context.report({ node: reportNode, messageId: 'unexpected' });
        }

        return {
            Program(node) {
                for (const statement of node.body) {
                    if (! isImportLikeNode(statement))
                        continue;

                    checkSource(statement.source, getStaticSource(statement));
                }
            },
            ImportExpression(node) {
                if (node.source.type !== 'Literal' || typeof node.source.value !== 'string')
                    return;

                checkSource(node.source, node.source.value);
            },
        };
    },
};
