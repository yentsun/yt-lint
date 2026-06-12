import { getLeadingImports, getNextTopLevelContent } from '../utils/imports.js';
import { getLinebreak } from '../utils/ast.js';


export default {
    meta: {
        type: 'layout',
        docs: {
            description: 'Require exactly two blank lines after the final top-level import',
        },
        fixable: 'whitespace',
        schema: [],
        messages: {
            expected: 'Expected exactly two blank lines after the final import.',
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;

        return {
            Program(node) {
                const imports = getLeadingImports(node);

                if (! imports.length || imports.length === node.body.length)
                    return;

                const lastImport = imports.at(-1);
                const nextContent = getNextTopLevelContent(sourceCode, node, lastImport);

                if (! nextContent?.loc)
                    return;

                const actualGap = nextContent.loc.start.line - lastImport.loc.end.line - 1;

                if (actualGap === 2)
                    return;

                context.report({
                    node: nextContent,
                    messageId: 'expected',
                    fix(fixer) {
                        const linebreak = getLinebreak(sourceCode.text);
                        // Same-line trailing comments live past `lastImport.range[1]` — start
                        // the spacing replacement after them so --fix doesn't delete a directive.
                        const trailingComments = sourceCode.getAllComments()
                            .filter(comment => comment.range[0] >= lastImport.range[1]
                                && comment.loc.start.line === lastImport.loc.end.line);
                        const rangeStart = trailingComments.length
                            ? trailingComments.at(-1).range[1]
                            : lastImport.range[1];
                        const spacingRange = [ rangeStart, nextContent.range[0] ];

                        return fixer.replaceTextRange(spacingRange, `${linebreak}${linebreak}${linebreak}`);
                    },
                });
            },
        };
    },
};
