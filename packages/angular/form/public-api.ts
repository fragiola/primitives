// The entry of @fragiola/primitives-angular/form: a native form that validates its Fields, shows
// server errors and focuses the first invalid field (spec/form.md), as a standalone directive on
// the consumer's own `<form>`. It is built on `/field` (the Fields register with it).

export type {
    FieldValidationMode,
    FormErrors,
} from "@fragiola/primitives/form";
export { Form } from "./directives/form.directive.ts";
