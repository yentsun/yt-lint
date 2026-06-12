import { builtinModules } from 'node:module';


const NODE_BUILTINS = new Set(
    builtinModules.map(name => name.startsWith('node:') ? name.slice(5) : name)
);

export function normalizeFilename(filename) {
    return filename.replaceAll('\\', '/');
}

export function isNodeBuiltinSource(source) {
    if (source.startsWith('node:'))
        return true;

    const baseModule = source.split('/')[0];

    return NODE_BUILTINS.has(baseModule);
}

export function isRelativeSource(source) {
    return source.startsWith('./') || source.startsWith('../');
}

export function resolvePosix(fromDir, relative) {
    const segments = `${fromDir}/${relative}`.split('/');
    const stack = [];

    for (const segment of segments) {
        if (segment === '' || segment === '.')
            continue;

        if (segment === '..') {
            stack.pop();
            continue;
        }

        stack.push(segment);
    }

    return `/${stack.join('/')}`;
}

export function makeGetPackageName(packageRootPattern = 'packages/*') {
    const prefix = packageRootPattern.replace(/\/?\*.*$/, '');
    const escapedPrefix = prefix.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(?:^|/)${escapedPrefix}/([^/]+)`);

    return posixPath => {
        const match = posixPath.match(re);

        return match ? match[1] : null;
    };
}

function globToRegex(glob) {
    const escaped = glob
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '\x00')
        .replace(/\*/g, '[^/]*')
        .replace(/\x00/g, '.*')
        .replace(/\?/g, '[^/]');

    return new RegExp(escaped);
}

export function matchesAnyGlob(filePath, globs) {
    return globs.some(glob => globToRegex(glob).test(filePath));
}
