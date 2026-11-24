import { fileUpload } from "examples-shared/recipes/file-upload";

// The example's classes: the FileUpload recipe, with a round Dropzone and a round preview the
// size of an avatar (whole pixels: a drop lands on it), and the row of buttons.
export const styles = {
    ...fileUpload,
    root: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    row: "flex items-center gap-4",
    dropzone: `${fileUpload.dropzone} size-24 shrink-0 rounded-full px-2 text-xs`,
    itemGroup: "flex",
    item: "flex items-center gap-2",
    preview: "size-24 overflow-hidden rounded-full bg-palette-soft",
    image: "size-24 object-cover",
    itemDeleteTrigger: fileUpload.trigger,
};
