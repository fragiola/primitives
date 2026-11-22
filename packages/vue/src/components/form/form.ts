import {
    type FieldValidationMode,
    type FormErrors,
    firstInDocumentOrder,
    focusFieldControl,
    formErrorsFor,
    guardFormSubmit,
    withoutFormErrors,
} from "@fragiola/primitives/form";
import {
    defineComponent,
    nextTick,
    type PropType,
    provide,
    shallowRef,
    watch,
} from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { type FormField, FormKey } from "../field/form-context.ts";

export type FormState = Record<never, never>;

export interface FormProps {
    /** Server errors, keyed by the fields' `name`; the Form keeps its own copy. */
    errors?: FormErrors;
    /** The default of every Field inside it (default `"onSubmit"`). */
    validationMode?: FieldValidationMode;
}

export type FormEmits = {
    /** A field's value changed while the Form had errors for it: the errors left. */
    clearErrors: (errors: FormErrors) => true;
};

const NO_ERRORS: FormErrors = {};

/** Focuses the first of these fields, in document order, that has a focus target. */
function focusFirst(fields: readonly FormField[]): void {
    const target = firstInDocumentOrder(
        fields.map((field) => field.focusTarget()),
    );
    if (target !== null) {
        focusFieldControl(target);
    }
}

/**
 * A native `form` that validates its Fields itself (`novalidate`): a submission shows every error,
 * focuses the first invalid field and is blocked while one is invalid, before any `@submit` of the
 * consumer's runs; it shows server errors on the fields they name (spec/form.md).
 */
export const Form: PartComponent<FormProps, FormState, FormEmits> =
    publicComponent(
        defineComponent({
            // a single-word name would read as the `form` element
            name: "FormRoot",
            inheritAttrs: false,
            props: {
                ...asProp,
                /** Server errors, keyed by the fields' `name`; the Form keeps its own copy. */
                errors: {
                    type: Object as PropType<FormErrors>,
                    default: undefined,
                },
                /** The default of every Field inside it (default `"onSubmit"`). */
                validationMode: {
                    type: String as PropType<FieldValidationMode>,
                    default: "onSubmit",
                },
            },
            emits: {
                /** A field's value changed while the Form had errors for it: the errors left. */
                clearErrors: (_errors: FormErrors) => true,
            },
            setup(props, { attrs, slots, emit }) {
                const errors = shallowRef<FormErrors>(
                    props.errors ?? NO_ERRORS,
                );
                const fields = new Set<FormField>();
                // a submission went on: the next `errors` is the server's answer
                let submitted = false;
                watch(
                    () => props.errors,
                    (next) => {
                        errors.value = next ?? NO_ERRORS;
                        if (submitted) {
                            submitted = false;
                            // once the fields rendered the new errors: the first field the
                            // server's answer names
                            void nextTick().then(() =>
                                focusFirst(
                                    [...fields].filter(
                                        (field) =>
                                            formErrorsFor(
                                                errors.value,
                                                field.name(),
                                            ).length > 0,
                                    ),
                                ),
                            );
                        }
                    },
                );
                provide(FormKey, {
                    validationMode: () => props.validationMode,
                    errors,
                    clearErrors(name) {
                        const next = withoutFormErrors(errors.value, name);
                        if (next !== errors.value) {
                            errors.value = next;
                            emit("clearErrors", next);
                        }
                    },
                    register(field) {
                        fields.add(field);
                        return () => {
                            fields.delete(field);
                        };
                    },
                });

                const element = shallowRef<HTMLElement | null>(null);
                const setElement = elementSetter(element);
                const attempt = () => {
                    // every field validates and shows its errors, the first invalid takes focus
                    const invalid = [...fields].filter((field) =>
                        field.submitAttempt(),
                    );
                    if (invalid.length > 0) {
                        focusFirst(invalid);
                        return false;
                    }
                    submitted = true;
                    return true;
                };
                watch(
                    element,
                    (form, _, onCleanup) => {
                        if (form instanceof HTMLFormElement) {
                            onCleanup(guardFormSubmit(form, attempt));
                        }
                    },
                    { flush: "post" },
                );
                return () =>
                    renderPart(
                        "form",
                        { attrs, slots },
                        props.as,
                        {},
                        {
                            novalidate: true,
                            "data-primitives-part": "form-root",
                            ref: setElement,
                        },
                    );
            },
        }),
    );
