import type { FileRejection } from "@fragiola/primitives-vue/file-upload";

/** The names of `files`, joined (`none` for none). */
export const fileNames = (files: readonly File[] | undefined) =>
    files === undefined || files.length === 0
        ? undefined
        : files.map((file) => file.name).join(", ");

/** Each rejection as `name (reasons)`, joined (`none` for none). */
export const rejections = (rejected: readonly FileRejection<File>[]) =>
    rejected.length === 0
        ? undefined
        : rejected
              .map(
                  (entry) => `${entry.file.name} (${entry.reasons.join(", ")})`,
              )
              .join("; ");
