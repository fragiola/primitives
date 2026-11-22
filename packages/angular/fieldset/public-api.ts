// The entry of @fragiola/primitives-angular/fieldset: fields grouped under a legend and disabled
// together (spec/fieldset.md), as standalone attribute directives on the consumer's own elements.
// It is built on `/field` (the Fields inside read its disabled state).

export { FieldsetLegend } from "./directives/fieldset-legend.directive.ts";
export {
    FieldsetRoot,
    type FieldsetState,
} from "./directives/fieldset-root.directive.ts";
