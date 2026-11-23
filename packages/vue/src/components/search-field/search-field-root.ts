import { bridgeForm } from "@fragiola/primitives/form";
import {
    computed,
    defineComponent,
    nextTick,
    provide,
    shallowRef,
    useId,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useFieldControl } from "../../composables/use-field-control.ts";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    SearchFieldKey,
    type SearchFieldState,
} from "./search-field-context.ts";

export interface SearchFieldRootProps {
    /** The query (controlled; `v-model:value`). */
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    /** The Input's `name`. */
    name?: string;
    /** The Input's `id`. */
    id?: string;
}

export type SearchFieldRootEmits = {
    "update:value": (value: string) => true;
    valueChange: (value: string, details: ChangeDetails) => true;
    /** Enter in the Input, with the current query. */
    submit: (value: string) => true;
};

/**
 * Holds a SearchField's query (spec/search-field.md, React Aria's search field): Escape and the
 * ClearButton empty it, Enter submits it.
 */
export const SearchFieldRoot: PartComponent<
    SearchFieldRootProps,
    SearchFieldState,
    SearchFieldRootEmits
> = publicComponent(
    defineComponent({
        name: "SearchFieldRoot",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: String, default: undefined },
            defaultValue: { type: String, default: "" },
            disabled: { type: Boolean, default: false },
            readOnly: { type: Boolean, default: false },
            required: { type: Boolean, default: false },
            name: { type: String, default: undefined },
            id: { type: String, default: undefined },
        },
        emits: {
            "update:value": (_value: string) => true,
            valueChange: (_value: string, _details: ChangeDetails) => true,
            submit: (_value: string) => true,
        },
        setup(props, { attrs, slots, emit }) {
            const generatedId = useId();
            const inputId = () => props.id ?? generatedId;
            const value = useControllable<string, ChangeDetails>(
                () => props.value,
                props.defaultValue,
                (next, details) => {
                    emit("update:value", next);
                    emit("valueChange", next, details);
                },
            );
            const input = shallowRef<HTMLElement | null>(null);
            const field = useFieldControl({
                id: inputId,
                labelable: true,
                value: () => value.value.value,
                filled: () => value.value.value !== "",
                input: () => input.value as HTMLInputElement | null,
                focusTarget: () => input.value,
            });
            const disabled = () => props.disabled || field.disabled();
            // a controlled value the consumer kept does not re-render the input: re-assert it
            const reassert = () => {
                const element = input.value as HTMLInputElement | null;
                void nextTick().then(() => {
                    if (
                        element !== null &&
                        element.value !== value.value.value
                    ) {
                        element.value = value.value.value;
                    }
                });
            };

            watch(
                input,
                (element, _, onCleanup) => {
                    if (!(element instanceof HTMLInputElement)) {
                        return;
                    }
                    onCleanup(
                        bridgeForm(element, {
                            reset: () => {
                                field.reset();
                                value.set(props.defaultValue, {
                                    reason: "none",
                                });
                                element.value = value.value.value;
                            },
                        }),
                    );
                },
                { flush: "post" },
            );

            const state = computed<SearchFieldState>(() => ({
                value: value.value.value,
                empty: value.value.value === "",
                disabled: disabled(),
                readOnly: props.readOnly,
                required: props.required,
            }));
            const attributes = computed(() =>
                stateAttributes({
                    empty: state.value.empty,
                    disabled: state.value.disabled,
                    readonly: state.value.readOnly,
                    required: state.value.required,
                }),
            );
            provide(SearchFieldKey, {
                state,
                inputId,
                name: () => field.name() ?? props.name,
                field,
                attributes,
                onInputText: (text, event) => {
                    value.set(text, { reason: "input-change", event });
                    reassert();
                },
                onEscape: (event) => {
                    if (
                        value.value.value === "" ||
                        disabled() ||
                        props.readOnly
                    ) {
                        // left to the page (spec/search-field.md, "Keyboard")
                        return false;
                    }
                    value.set("", { reason: "escape-key", event });
                    reassert();
                    return true;
                },
                onEnter: () => {
                    if (!disabled() && !props.readOnly) {
                        emit("submit", value.value.value);
                    }
                },
                clear: (event) => {
                    if (disabled() || props.readOnly) {
                        return;
                    }
                    if (value.value.value !== "") {
                        value.set("", { reason: "clear-press", event });
                        reassert();
                    }
                    input.value?.focus();
                },
                setInput: elementSetter(input),
            });

            return () =>
                renderPart("div", { attrs, slots }, props.as, state.value, {
                    "data-primitives-part": "search-field-root",
                    ...attributes.value,
                    ...field.attributes(),
                });
        },
    }),
);
