import { defineComponent, nextTick, shallowRef, watch } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { type OTPFieldInputState, OTPFieldKey } from "./otp-field-context.ts";

/**
 * One slot of the code: a native input holding one character (spec/otp-field.md). Its name is
 * the consumer's, which says its position.
 */
export const OTPFieldInput: PartComponent<
    Record<never, never>,
    OTPFieldInputState
> = publicComponent(
    defineComponent({
        name: "OTPFieldInput",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(OTPFieldKey, "OTPField.Input");
            const element = shallowRef<HTMLInputElement | null>(null);
            const setElement = (value: unknown) => {
                const next =
                    value instanceof HTMLInputElement
                        ? value
                        : ((value as { $el?: HTMLInputElement } | null)?.$el ??
                          null);
                if (element.value !== next) {
                    element.value = next;
                }
            };
            // once mounted, in document order (as Toolbar's items): a server render knows no slot
            watch(
                element,
                (slot, _, onCleanup) => {
                    if (slot !== null) {
                        onCleanup(context.register(slot));
                    }
                },
                { flush: "post" },
            );
            const index = () => context.indexOf(element.value);
            const character = () => {
                const at = index();
                return at >= 0
                    ? (Array.from(context.state.value.value)[at] ?? "")
                    : "";
            };

            const onMousedown = (event: MouseEvent) => {
                const at = index();
                if (
                    event.button !== 0 ||
                    context.state.value.disabled ||
                    at < 0
                ) {
                    return;
                }
                // focused without a caret inside its character: it is selected
                event.preventDefault();
                context.focusSlot(at);
            };
            const onFocus = (event: FocusEvent) => {
                const at = index();
                if (at >= 0) {
                    context.onSlotFocus(
                        at,
                        event.currentTarget as HTMLInputElement,
                    );
                }
            };
            const onBlur = (event: FocusEvent) =>
                context.onSlotBlur(event.relatedTarget);
            const onInput = (event: Event) => {
                const at = index();
                const input = event.currentTarget as HTMLInputElement;
                if (at >= 0) {
                    context.onSlotText(at, input.value, event);
                }
                // the slot shows its character: a refused one, or one the render does not change
                // (a controlled value the consumer kept), is written back
                input.value = character();
                void nextTick().then(() => {
                    const text = character();
                    if (input.value !== text) {
                        input.value = text;
                    }
                });
            };
            const onPaste = (event: ClipboardEvent) => {
                const at = index();
                const { disabled, readOnly } = context.state.value;
                if (at < 0 || disabled || readOnly) {
                    return;
                }
                event.preventDefault();
                context.onSlotPaste(
                    at,
                    event.clipboardData?.getData("text/plain") ?? "",
                    event,
                );
            };
            const onKeydown = (event: KeyboardEvent) => {
                const at = index();
                if (at >= 0) {
                    context.onSlotKeydown(at, event);
                }
            };

            return () => {
                const at = index();
                const known = at >= 0;
                const slotCharacter = character();
                const root = context.state.value;
                const state: OTPFieldInputState = {
                    ...root,
                    index: at,
                    character: slotCharacter,
                    filled: slotCharacter !== "",
                };
                const named =
                    attrs["aria-label"] !== undefined ||
                    attrs["aria-labelledby"] !== undefined;
                const aria = context.field.aria();
                const id = context.id();
                return renderPart("input", { attrs, slots }, props.as, state, {
                    id: known ? (at === 0 ? id : `${id}-${at + 1}`) : undefined,
                    type: context.mask() ? "password" : "text",
                    inputmode: context.inputMode(),
                    autocomplete: at === 0 ? context.autoComplete() : "off",
                    autocorrect: "off",
                    spellcheck: "false",
                    enterkeyhint: at === root.length - 1 ? "done" : "next",
                    maxlength: at === 0 ? root.length : undefined,
                    tabindex: known && at === context.activeIndex() ? 0 : -1,
                    value: slotCharacter,
                    disabled: root.disabled,
                    readonly: root.readOnly,
                    "aria-labelledby": named
                        ? undefined
                        : aria["aria-labelledby"],
                    "aria-invalid": aria["aria-invalid"],
                    "data-primitives-part": "otp-field-input",
                    ...context.attributes(),
                    ...stateAttributes({
                        filled: slotCharacter !== "",
                        index: known ? String(at) : undefined,
                    }),
                    onMousedown,
                    onFocus,
                    onBlur,
                    onInput,
                    onPaste,
                    onKeydown,
                    ref: setElement,
                });
            };
        },
    }),
);
