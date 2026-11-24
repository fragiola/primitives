/** A file's name and type, all an `accept` pattern reads. */
export interface FileLike {
    readonly name: string;
    readonly type: string;
}

/** The `accept` of a file input: a comma-separated string, or its patterns (spec/drop-zone.md). */
export type FileAccept = string | readonly string[];

/** The patterns of `accept`, trimmed and lowercased; `[]` takes every file. */
function acceptPatterns(accept: FileAccept | undefined): string[] {
    if (accept === undefined) {
        return [];
    }
    const list = typeof accept === "string" ? accept.split(",") : accept;
    return list
        .map((pattern) => pattern.trim().toLowerCase())
        .filter((pattern) => pattern !== "");
}

/** `accept` as a file input's attribute (`undefined` for none). */
export function acceptAttribute(
    accept: FileAccept | undefined,
): string | undefined {
    const patterns =
        accept === undefined
            ? []
            : (typeof accept === "string" ? accept.split(",") : accept)
                  .map((pattern) => pattern.trim())
                  .filter((pattern) => pattern !== "");
    return patterns.length === 0 ? undefined : patterns.join(",");
}

/**
 * Whether `file` matches `accept`, as a file input's `accept` reads it (spec/drop-zone.md, "API"):
 * an extension (`.pdf`, case insensitive), a MIME type (`image/png`) or a wildcard (`image/*`).
 * No `accept` (or an empty one) takes every file.
 */
export function acceptsFile(
    file: FileLike,
    accept: FileAccept | undefined,
): boolean {
    const patterns = acceptPatterns(accept);
    if (patterns.length === 0) {
        return true;
    }
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return patterns.some((pattern) => {
        if (pattern.startsWith(".")) {
            return name.endsWith(pattern);
        }
        if (pattern.endsWith("/*")) {
            return type.startsWith(pattern.slice(0, -1));
        }
        return type === pattern;
    });
}

/**
 * A DropZone's split of the files it was given (spec/drop-zone.md): the ones `accept` takes, and
 * the others. When `multiple` is `false`, more than one file rejects them all.
 */
export function acceptFiles<File extends FileLike>(
    files: readonly File[],
    accept: FileAccept | undefined,
    multiple: boolean,
): { accepted: File[]; rejected: File[] } {
    if (!multiple && files.length > 1) {
        return { accepted: [], rejected: [...files] };
    }
    const accepted: File[] = [];
    const rejected: File[] = [];
    for (const file of files) {
        (acceptsFile(file, accept) ? accepted : rejected).push(file);
    }
    return { accepted, rejected };
}
