import { getLinebreak } from '../utils/ast.js';


export default {
    meta: {
        type: 'layout',
        docs: {
            description: 'Require a blank line after an if statement before the next statement',
        },
        fixable: 'whitespace',
        schema: [],
        messages: {
            expected: 'Expected a blank line after if statement.',
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;

        function hasBlankLineBetween(prev, next) {
            const between = sourceCode.text.slice(prev.range[1], next.range[0]);

            return /\r?\n[ \t]*\r?\n/.test(between);
        }

        function check(statements) {
            for (let i = 0; i < statements.length - 1; i++) {
                const prev = statements[i];
                const next = statements[i + 1];

                if (prev.type !== 'IfStatement')
                    continue;

                // Single-line patterns like `{ if (v) acc[k] = v; return acc; }` don't need a
                // blank line — this rule is about visual separation between multi-line blocks.
                if (prev.loc.end.line === next.loc.start.line)
                    continue;

                if (hasBlankLineBetween(prev, next))
                    continue;

                context.report({
                    node: next,
                    messageId: 'expected',
                    fix(fixer) {
                        const linebreak = getLinebreak(sourceCode.text);
                        // Skip past same-line trailing comments so the blank line lands after them.
                        const trailingComments = sourceCode.getCommentsAfter(prev)
                            .filter(comment => comment.loc.start.line === prev.loc.end.line);
                        const rangeStart = trailingComments.length
                            ? trailingComments.at(-1).range[1]
                            : prev.range[1];
                        // Keep leading comments attached to the next statement — insert before them.
                        const leadingComments = sourceCode.getCommentsBefore(next)
                            .filter(comment => comment.range[0] >= rangeStart);
                        const insertionPoint = leadingComments.length
                            ? leadingComments[0].range[0]
                            : next.range[0];
                        const lineStart = sourceCode.text.lastIndexOf('\n', insertionPoint - 1) + 1;
                        const indent = sourceCode.text.slice(lineStart, insertionPoint);

                        return fixer.replaceTextRange(
                            [ rangeStart, insertionPoint ],
                            `${linebreak}${linebreak}${indent}`
                        );
                    },
                });
            }
        }

        return {
            Program(node) { check(node.body); },
            BlockStatement(node) { check(node.body); },
            SwitchCase(node) { check(node.consequent); },
        };
    },
};
