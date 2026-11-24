/**
 * A copy of `files` that a Field can compare (spec/file-upload.md, "Forms"): a Field detects a
 * change of its control's value by its JSON text, and a `File` writes `{}`; the copy writes each
 * file as `name:size:type:lastModified` (a non-enumerable `toJSON`), so a replaced file is a
 * change. It is still the files, for the Field's `validate`.
 */
export function fieldFiles(files: readonly File[]): File[] {
    const copy = [...files];
    Object.defineProperty(copy, "toJSON", {
        value: () =>
            files.map(
                (file) =>
                    `${file.name}:${file.size}:${file.type}:${file.lastModified}`,
            ),
    });
    return copy;
}
