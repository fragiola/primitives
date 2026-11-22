// The entry of @fragiola/primitives-angular/render: the primitive contract's render utilities
// (spec/README.md, "Render utilities"). A directive sits on the consumer's own element (Angular's
// `render`), so there is nothing to render: `dataValue` and `dataValues` give the `data-*` host
// binding values (`""`, a string, or `null` to remove), as every part's state attributes.

export {
    dataValue,
    dataValues,
} from "@fragiola/primitives-angular/internal";
