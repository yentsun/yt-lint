import { isSameLine } from '../utils/ast.js';


export default {
    meta: {
        type: 'layout',
        docs: {
            description: 'Require spaced object braces, except for adjacent nested closing braces',
        },
        fixable: 'whitespace',
        schema: [],
        messages: {
            expectedSpaceAfterOpening: 'Expected a space after `{`.',
            expectedSpaceBeforeClosing: 'Expected a space before `}`.',
            unexpectedSpaceBeforeNestedClosing: 'Expected `}}` with no space between nested closing braces.',
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;

        function check(node) {
            if (! node.properties?.length)
                return;

            const openingBrace = sourceCode.getFirstToken(node);
            const closingBrace = sourceCode.getLastToken(node);
            const firstInnerToken = sourceCode.getTokenAfter(openingBrace);
            const lastInnerToken = sourceCode.getTokenBefore(closingBrace);

            if (isSameLine(openingBrace, firstInnerToken)) {
                const textBetween = sourceCode.text.slice(openingBrace.range[1], firstInnerToken.range[0]);

                if (textBetween !== ' ') {
                    const isWhitespaceOnly = /^\s*$/.test(textBetween);

                    context.report({
                        node,
                        loc: { start: openingBrace.loc.end, end: firstInnerToken.loc.start },
                        messageId: 'expectedSpaceAfterOpening',
                        ...isWhitespaceOnly && {
                            fix(fixer) {
                                return fixer.replaceTextRange([ openingBrace.range[1], firstInnerToken.range[0] ], ' ');
                            },
                        },
                    });
                }
            }

            if (! isSameLine(lastInnerToken, closingBrace))
                return;

            const textBetween = sourceCode.text.slice(lastInnerToken.range[1], closingBrace.range[0]);
            const isWhitespaceOnly = /^\s*$/.test(textBetween);

            if (lastInnerToken.value === '}') {
                if (textBetween !== '') {
                    context.report({
                        node,
                        loc: { start: lastInnerToken.loc.end, end: closingBrace.loc.start },
                        messageId: 'unexpectedSpaceBeforeNestedClosing',
                        ...isWhitespaceOnly && {
                            fix(fixer) {
                                return fixer.replaceTextRange([ lastInnerToken.range[1], closingBrace.range[0] ], '');
                            },
                        },
                    });
                }

                return;
            }

            if (textBetween !== ' ') {
                context.report({
                    node,
                    loc: { start: lastInnerToken.loc.end, end: closingBrace.loc.start },
                    messageId: 'expectedSpaceBeforeClosing',
                    ...isWhitespaceOnly && {
                        fix(fixer) {
                            return fixer.replaceTextRange([ lastInnerToken.range[1], closingBrace.range[0] ], ' ');
                        },
                    },
                });
            }
        }

        return {
            ObjectExpression: check,
            ObjectPattern: check,
        };
    },
};
