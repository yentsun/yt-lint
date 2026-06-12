import { getDeclarationStep, getLinebreak } from '../utils/ast.js';


export default {
    meta: {
        type: 'layout',
        docs: {
            description: 'Disallow blank lines between consecutive variable declarations',
        },
        fixable: 'whitespace',
        schema: [],
        messages: {
            unexpected: 'Unexpected blank line between consecutive variable declarations.',
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;

        function check(statements) {
            for (let i = 1; i < statements.length; i++) {
                const prev = statements[i - 1];
                const curr = statements[i];

                if (prev.type !== 'VariableDeclaration' || curr.type !== 'VariableDeclaration')
                    continue;

                if (curr.loc.start.line - prev.loc.end.line <= 1)
                    continue;

                // A comment between declarations is a reason to separate them — keep author intent.
                const hasIntervening = sourceCode.getCommentsBefore(curr)
                    .some(comment => comment.range[0] >= prev.range[1]);

                if (hasIntervening)
                    continue;

                // Different preparation steps (free / sync-call / async-call) require a blank line
                // per blank-line-after-unpacking — skip those boundaries so the rules don't fight.
                if (getDeclarationStep(prev) !== getDeclarationStep(curr))
                    continue;

                context.report({
                    node: curr,
                    messageId: 'unexpected',
                    fix: fixer => {
                        const linebreak = getLinebreak(sourceCode.text);
                        const lineStart = sourceCode.text.lastIndexOf('\n', curr.range[0] - 1) + 1;
                        const indent = sourceCode.text.slice(lineStart, curr.range[0]);

                        return fixer.replaceTextRange(
                            [ prev.range[1], curr.range[0] ],
                            `${linebreak}${indent}`
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
