import { getDeclarationStep, STEP_LABEL, getLinebreak } from '../utils/ast.js';


export default {
    meta: {
        type: 'layout',
        docs: {
            description: 'Require blank lines between leading variable-declaration preparation steps (free / sync-call / async-call) and before the first subsequent statement',
        },
        fixable: 'whitespace',
        schema: [],
        messages: {
            betweenSteps: 'Expected a blank line between {{prevLabel}} and {{currLabel}} declarations — they belong to different preparation steps.',
            beforeWork: 'Expected a blank line after the preparation block before subsequent code.',
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;

        function hasBlankLineBetween(prev, next) {
            const between = sourceCode.text.slice(prev.range[1], next.range[0]);

            return /\r?\n[ \t]*\r?\n/.test(between);
        }

        function insertBlankLineFix(prev, next) {
            return function fix(fixer) {
                const linebreak = getLinebreak(sourceCode.text);
                const trailingComments = sourceCode.getCommentsAfter(prev)
                    .filter(comment => comment.loc.start.line === prev.loc.end.line);
                const rangeStart = trailingComments.length
                    ? trailingComments.at(-1).range[1]
                    : prev.range[1];
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
            };
        }

        function check(statements) {
            if (statements.length < 2)
                return;

            // Find the leading run of variable declarations — the "preparation" block.
            let runEnd = 0;

            while (runEnd < statements.length && statements[runEnd].type === 'VariableDeclaration')
                runEnd++;

            if (runEnd === 0)
                return;

            // Within the preparation block, require a blank line at each kind transition.
            for (let i = 1; i < runEnd; i++) {
                const prev = statements[i - 1];
                const curr = statements[i];
                const prevStep = getDeclarationStep(prev);
                const currStep = getDeclarationStep(curr);

                if (prevStep === currStep)
                    continue;

                if (hasBlankLineBetween(prev, curr))
                    continue;

                context.report({
                    node: curr,
                    messageId: 'betweenSteps',
                    data: { prevLabel: STEP_LABEL[prevStep], currLabel: STEP_LABEL[currStep] },
                    fix: insertBlankLineFix(prev, curr),
                });
            }

            if (runEnd === statements.length)
                return;

            const lastPrep = statements[runEnd - 1];
            const firstWork = statements[runEnd];

            if (hasBlankLineBetween(lastPrep, firstWork))
                return;

            context.report({
                node: firstWork,
                messageId: 'beforeWork',
                fix: insertBlankLineFix(lastPrep, firstWork),
            });
        }

        return {
            Program(node) { check(node.body); },
            BlockStatement(node) { check(node.body); },
        };
    },
};
