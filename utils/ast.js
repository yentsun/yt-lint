export const FUNCTION_NODE_TYPES = new Set([
    'FunctionDeclaration',
    'FunctionExpression',
    'ArrowFunctionExpression',
]);

const AWAIT_NODE_TYPES = new Set([ 'AwaitExpression' ]);
const CALL_NODE_TYPES = new Set([ 'CallExpression', 'NewExpression', 'TaggedTemplateExpression' ]);

export function subtreeContains(node, targetTypes) {
    if (! node || typeof node !== 'object' || ! node.type)
        return false;

    if (targetTypes.has(node.type))
        return true;

    if (FUNCTION_NODE_TYPES.has(node.type))
        return false;

    for (const key of Object.keys(node)) {
        if (key === 'parent' || key === 'loc' || key === 'range' || key === 'comments')
            continue;

        const value = node[key];

        if (Array.isArray(value)) {
            for (const child of value) {
                if (subtreeContains(child, targetTypes))
                    return true;
            }

            continue;
        }

        if (value && typeof value === 'object' && subtreeContains(value, targetTypes))
            return true;
    }

    return false;
}

export function getDeclarationStep(node) {
    if (node.type !== 'VariableDeclaration')
        return null;

    let step = 'free';

    for (const declarator of node.declarations) {
        if (! declarator.init)
            continue;

        if (subtreeContains(declarator.init, AWAIT_NODE_TYPES))
            return 'async';

        if (subtreeContains(declarator.init, CALL_NODE_TYPES))
            step = 'sync';
    }

    return step;
}

export const STEP_LABEL = {
    free: 'free-extraction',
    sync: 'sync-call',
    async: 'async-call',
};

export function getLinebreak(text) {
    return text.includes('\r\n') ? '\r\n' : '\n';
}

export function isSameLine(leftToken, rightToken) {
    return leftToken.loc.end.line === rightToken.loc.start.line;
}
