export function getStaticSource(node) {
    if (! node?.source || typeof node.source.value !== 'string')
        return null;

    return node.source.value;
}

export function isImportLikeNode(node) {
    return node.type === 'ImportDeclaration'
        || node.type === 'ExportNamedDeclaration'
        || node.type === 'ExportAllDeclaration';
}

export function getLeadingImports(program) {
    const imports = [];

    for (const statement of program.body) {
        // Skip directive prologues like 'use client' / 'use strict' before imports.
        if (statement.type === 'ExpressionStatement'
            && statement.expression.type === 'Literal'
            && typeof statement.expression.value === 'string')
            continue;

        if (statement.type !== 'ImportDeclaration')
            break;

        imports.push(statement);
    }

    return imports;
}

export function getImportEnd(sourceCode, importNode, nextImport) {
    const trailingComment = sourceCode.getCommentsAfter(importNode)
        .find(comment => comment.loc.start.line === importNode.loc.end.line
            && (! nextImport || comment.range[1] <= nextImport.range[0]));

    return trailingComment ? trailingComment.range[1] : importNode.range[1];
}

export function getImportEntries(sourceCode, imports) {
    return imports.map((importNode, index) => {
        const previousImport = imports[index - 1];
        const nextImport = imports[index + 1];
        const start = index === 0
            ? importNode.range[0]
            : getImportEnd(sourceCode, previousImport, importNode);
        const end = getImportEnd(sourceCode, importNode, nextImport);

        return {
            importNode,
            source: getStaticSource(importNode),
            text: sourceCode.text.slice(start, end).trim(),
        };
    });
}

export function getNextTopLevelContent(sourceCode, program, lastImport) {
    const nextStatement = program.body.find(statement => statement.range[0] > lastImport.range[1]);
    const nextComment = sourceCode.getAllComments()
        .find(comment => comment.range[0] > lastImport.range[1]
            && comment.loc.start.line > lastImport.loc.end.line
            && (! nextStatement || comment.range[0] < nextStatement.range[0]));

    if (nextComment)
        return nextComment;

    return nextStatement ?? null;
}
