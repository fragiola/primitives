import { field } from "examples-shared/recipes/field";
import { fileUpload } from "examples-shared/recipes/file-upload";

// The example's classes: the FileUpload recipe (one string per part) under names the markup can
// read without a string, the Field recipe for its label, description and error, the form, its
// button, a rejected file's reasons and the status line.
export const styles = {
    ...fileUpload,
    itemGroup: fileUpload["item-group"],
    itemText: fileUpload["item-text"],
    itemName: fileUpload["item-name"],
    itemSizeText: fileUpload["item-size-text"],
    itemDeleteTrigger: fileUpload["item-delete-trigger"],
    clearTrigger: fileUpload["clear-trigger"],
    field,
    form: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    reasons: "text-xs",
    submit: "h-(--pr-control-height) px-3 rounded-control border border-palette-line bg-palette-base text-palette-contrast font-medium hover:bg-palette-soft outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-2 focus-visible:outline-palette-ring",
    status: "text-palette-accent/85",
};
