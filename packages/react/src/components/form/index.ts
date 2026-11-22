// The entry of @fragiola/primitives-react/form: a native form that validates its fields, focuses
// the first invalid one and shows server errors (spec/form.md). Built on Field, whose fields read it.

export type {
    FieldValidationMode,
    FormErrors,
} from "@fragiola/primitives/form";
export type { RenderProp } from "../../utils/render-element.tsx";
export { Form, type FormProps, type FormState } from "./form.tsx";
