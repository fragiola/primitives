import {
    createFieldValidator,
    type FieldState,
    type FieldValidate,
    type FieldValidation,
    type FieldValidationMode,
    fieldDescribedBy,
    fieldStateAttributes,
    formErrorsFor,
    shownAfterChange,
    UNVALIDATED,
    validatesOnChange,
} from "@fragiola/primitives/form";
import {
    computed,
    defineComponent,
    inject,
    onBeforeUnmount,
    onMounted,
    type PropType,
    provide,
    ref,
    shallowRef,
} from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type FieldControlEntry,
    type FieldControlEvents,
    type FieldControlHandle,
    FieldKey,
} from "./field-context.ts";
import { FieldsetKey } from "./fieldset-context.ts";
import { FormKey } from "./form-context.ts";

export interface FieldRootProps {
    /** The control's form name; it wins over the control's own, and keys the Form's errors. */
    name?: string;
    disabled?: boolean;
    /** Forces the invalid state (an error the app found). */
    invalid?: boolean;
    /** A message, a list of messages, or none; or a promise of one of these. */
    validate?: FieldValidate;
    /** Default: the enclosing Form's, else `"onSubmit"`. */
    validationMode?: FieldValidationMode;
}

/** Holds the field's state, validation and ids (spec/field.md). */
export const FieldRoot: PartComponent<FieldRootProps, FieldState> =
    publicComponent(
        defineComponent({
            name: "FieldRoot",
            inheritAttrs: false,
            props: {
                ...asProp,
                /** The control's form name; it wins over the control's own, and keys the Form's errors. */
                name: { type: String, default: undefined },
                disabled: { type: Boolean, default: false },
                /** Forces the invalid state (an error the app found). */
                invalid: { type: Boolean, default: false },
                /** A message, a list of messages, or none; or a promise of one of these. */
                validate: {
                    type: Function as PropType<FieldValidate>,
                    default: undefined,
                },
                /** Default: the enclosing Form's, else `"onSubmit"`. */
                validationMode: {
                    type: String as PropType<FieldValidationMode>,
                    default: undefined,
                },
            },
            setup(props, { attrs, slots }) {
                const fieldset = inject(FieldsetKey, null);
                const form = inject(FormKey, null);
                const touched = ref(false);
                const focused = ref(false);
                const dirty = ref(false);
                const filled = ref(false);
                const shown = shallowRef<FieldValidation>(UNVALIDATED);
                const labelId = ref<string>();
                const control = shallowRef<FieldControlEntry | null>(null);
                const messages = shallowRef<readonly HTMLElement[]>([]);
                let handle: FieldControlHandle | null = null;
                // whether the value changed once, or a submission was attempted (the required rule)
                let changed = false;
                let submitted = false;

                const mode = (): FieldValidationMode =>
                    props.validationMode ??
                    form?.validationMode() ??
                    "onSubmit";
                const disabled = () =>
                    props.disabled || (fieldset?.disabled() ?? false);
                const formErrors = computed(() =>
                    formErrorsFor(form?.errors.value, props.name),
                );

                // one validator for the field's life: latest wins, a resolved value is reused
                const validator = createFieldValidator();
                onBeforeUnmount(() => validator.cancel());
                const run = (
                    input: HTMLInputElement | null,
                    value: unknown,
                    always: boolean,
                    settle: (validation: FieldValidation) => void,
                ) =>
                    validator.run(
                        input,
                        {
                            value,
                            validate: props.validate,
                            valueChanged: changed,
                            always,
                        },
                        settle,
                    );
                const show = (validation: FieldValidation) => {
                    shown.value = validation;
                };

                const events: FieldControlEvents = {
                    mounted: (input, value, isFilled) => {
                        filled.value = isFilled;
                        // the custom validity only: a mount shows nothing
                        run(input, value, false, () => {});
                    },
                    changed: (input, value, isDirty, isFilled) => {
                        changed = true;
                        dirty.value = isDirty;
                        filled.value = isFilled;
                        // the first change clears the Form's errors for the field
                        if (
                            form !== null &&
                            props.name !== undefined &&
                            formErrors.value.length > 0
                        ) {
                            form.clearErrors(props.name);
                        }
                        const onChange = validatesOnChange(mode(), submitted);
                        const apply = (next: FieldValidation) => {
                            shown.value = shownAfterChange(
                                shown.value,
                                next,
                                onChange,
                            );
                        };
                        // pending: the field keeps what it showed until the run settles
                        const next = run(input, value, onChange, apply);
                        if (next !== null) {
                            apply(next);
                        }
                    },
                    focused: () => {
                        focused.value = true;
                    },
                    blurred: (input, value) => {
                        focused.value = false;
                        touched.value = true;
                        if (mode() === "onBlur") {
                            const next = run(input, value, false, show);
                            if (next !== null) {
                                show(next);
                            }
                        }
                    },
                    submitAttempt: (input, value) => {
                        submitted = true;
                        changed = true;
                        const next = run(
                            input,
                            value,
                            validatesOnChange(mode(), true),
                            show,
                        );
                        if (next !== null) {
                            show(next);
                        }
                        // a pending run counts as not invalid: the submission does not wait
                        return (
                            !disabled() &&
                            (next?.validity.valid === false ||
                                props.invalid ||
                                formErrors.value.length > 0)
                        );
                    },
                };

                const state = computed<FieldState>(() => ({
                    valid: disabled()
                        ? null
                        : props.invalid || formErrors.value.length > 0
                          ? false
                          : shown.value.validity.valid,
                    dirty: dirty.value,
                    touched: touched.value,
                    filled: filled.value,
                    focused: focused.value,
                    disabled: disabled(),
                }));

                if (form !== null) {
                    // from the mount on: a server render registers nothing
                    let unregister: (() => void) | null = null;
                    onMounted(() => {
                        unregister = form.register({
                            name: () => props.name,
                            submitAttempt: () =>
                                events.submitAttempt(
                                    handle?.input() ?? null,
                                    handle?.value(),
                                ),
                            focusTarget: () => handle?.focusTarget() ?? null,
                        });
                    });
                    onBeforeUnmount(() => {
                        unregister?.();
                        unregister = null;
                    });
                }

                provide(FieldKey, {
                    state,
                    invalid: computed(() => state.value.valid === false),
                    name: () => props.name,
                    disabled,
                    inForm: form !== null,
                    shown,
                    formErrors,
                    labelId,
                    control,
                    registerControl(entry) {
                        control.value = entry;
                        return () => {
                            if (control.value === entry) {
                                control.value = null;
                            }
                        };
                    },
                    attachControl(next) {
                        handle = next;
                        return () => {
                            if (handle === next) {
                                handle = null;
                            }
                        };
                    },
                    describedBy: computed(() =>
                        fieldDescribedBy(messages.value),
                    ),
                    registerMessage(element) {
                        messages.value = [...messages.value, element];
                        return () => {
                            messages.value = messages.value.filter(
                                (entry) => entry !== element,
                            );
                        };
                    },
                    events,
                });
                return () =>
                    renderPart("div", { attrs, slots }, props.as, state.value, {
                        "data-primitives-part": "field-root",
                        ...stateAttributes(fieldStateAttributes(state.value)),
                    });
            },
        }),
    );
