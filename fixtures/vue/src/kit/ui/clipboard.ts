import { Clipboard as Primitive } from "@fragiola/primitives-vue/clipboard";
import { clipboard } from "examples-shared/recipes/clipboard";
import { type Component, defineComponent, h, mergeProps } from "vue";
import { styled } from "../styled.ts";
import { icon } from "./icon.ts";

/** The Indicator with its copy, check and cross icons. */
export const ClipboardIcons = defineComponent({
    name: "ClipboardIcons",
    setup() {
        return () =>
            h(
                Primitive.Indicator as Component,
                { class: clipboard.indicator },
                {
                    default: () => [
                        icon(clipboard.copy, [
                            h("rect", {
                                x: "8",
                                y: "8",
                                width: "12",
                                height: "12",
                                rx: "2",
                            }),
                            h("path", {
                                d: "M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2",
                            }),
                        ]),
                        icon(clipboard.check, [
                            h("path", { d: "M5 12l5 5L20 7" }),
                        ]),
                        icon(clipboard.failed, [
                            h("path", {
                                d: "M6 6l12 12M18 6L6 18",
                            }),
                        ]),
                    ],
                },
            );
    },
});

/** The styled Trigger, holding the Indicator with its copy, check and cross icons. */
const Trigger = defineComponent({
    name: "StyledClipboardTrigger",
    inheritAttrs: false,
    setup(_, { attrs }) {
        return () =>
            h(
                Primitive.Trigger as Component,
                mergeProps({ class: clipboard.trigger }, attrs),
                { default: () => [h(ClipboardIcons)] },
            );
    },
});

export const Clipboard = {
    Root: styled(Primitive.Root, clipboard.root),
    Input: styled(Primitive.Input, clipboard.input),
    Trigger,
    /** A Trigger with a visible label beside its Indicator (its default scoped slot gets the state). */
    LabelledTrigger: styled(Primitive.Trigger, clipboard["labelled-trigger"]),
};
