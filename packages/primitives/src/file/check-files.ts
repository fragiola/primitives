import { acceptsFile, type FileAccept } from "./accept-files.ts";

/** A file as the checks read it: its name, type and size in bytes. */
export interface CheckedFile {
    readonly name: string;
    readonly type: string;
    readonly size: number;
}

/**
 * Why a file was rejected (spec/file-upload.md, "Purpose"): its type (`accept`), its size, the
 * count (`maxFiles`), or a reason of the app's own `validate`.
 */
export type FileRejectionReason =
    | "invalid-type"
    | "too-large"
    | "too-small"
    | "too-many"
    | (string & Record<never, never>);

/** A rejected file and every reason it failed. */
export interface FileRejection<File extends CheckedFile = CheckedFile> {
    file: File;
    reasons: readonly FileRejectionReason[];
}

/** A FileUpload's rules (spec/file-upload.md, "API"). */
export interface FileRules<File extends CheckedFile = CheckedFile> {
    accept?: FileAccept | undefined;
    /** At most this many accepted files (default `1`, which replaces the file on a new pick). */
    maxFiles?: number | undefined;
    /** Bytes, inclusive (default `0`). */
    minFileSize?: number | undefined;
    /** Bytes, inclusive (default `Infinity`). */
    maxFileSize?: number | undefined;
    /** The app's own reasons for a file (`null` or `[]` for none), given the files accepted so far. */
    validate?:
        | ((
              file: File,
              value: readonly File[],
          ) => readonly string[] | null | undefined)
        | undefined;
}

/** What a pick does to a FileUpload's files. */
export interface FileCheck<File extends CheckedFile = CheckedFile> {
    /** The accepted files after the pick: the value. */
    value: File[];
    /** The files of the pick that were accepted. */
    accepted: File[];
    /** The files of the pick that were rejected, with their reasons. */
    rejected: FileRejection<File>[];
}

/**
 * Checks the files of a pick against `rules`, given the accepted files `value` (spec/file-upload.md):
 * each file in order, every failing check a reason (`invalid-type`, `too-large`, `too-small`, the
 * app's own, then `too-many` for a file over `maxFiles`). With `maxFiles` `1`, a single good file
 * replaces the value and a pick of several rejects them all (`too-many`), as a native single file
 * input does.
 */
export function checkFiles<File extends CheckedFile>(
    value: readonly File[],
    files: readonly File[],
    rules: FileRules<File>,
): FileCheck<File> {
    const maxFiles = Math.max(1, rules.maxFiles ?? 1);
    const minSize = rules.minFileSize ?? 0;
    const maxSize = rules.maxFileSize ?? Number.POSITIVE_INFINITY;
    const single = maxFiles === 1;
    const kept: File[] = single ? [] : [...value];
    const accepted: File[] = [];
    const rejected: FileRejection<File>[] = [];
    for (const file of files) {
        const reasons: string[] = [];
        if (!acceptsFile(file, rules.accept)) {
            reasons.push("invalid-type");
        }
        if (file.size > maxSize) {
            reasons.push("too-large");
        }
        if (file.size < minSize) {
            reasons.push("too-small");
        }
        for (const reason of rules.validate?.(file, kept) ?? []) {
            if (!reasons.includes(reason)) {
                reasons.push(reason);
            }
        }
        if ((single && files.length > 1) || kept.length >= maxFiles) {
            reasons.push("too-many");
        }
        if (reasons.length === 0) {
            kept.push(file);
            accepted.push(file);
        } else {
            rejected.push({ file, reasons });
        }
    }
    return {
        value: single && accepted.length === 0 ? [...value] : kept,
        accepted,
        rejected,
    };
}
