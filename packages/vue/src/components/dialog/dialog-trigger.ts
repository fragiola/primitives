import { defineComponent, type PropType } from "vue";
import { elementSetter } from "../../composables/use-overlay-root.ts";
import {
    type OverlayTriggerProps,
    overlayTriggerProps,
    useOverlayTrigger,
} from "../../composables/use-overlay-trigger.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { DialogKey } from "./dialog-context.ts";
import type { DialogHandle } from "./dialog-handle.ts";

export interface DialogTriggerState {
    open: boolean;
    disabled: boolean;
}

/** Opens the dialog; with a `handle`, from anywhere in the page (spec/dialog.md). */
export interface DialogTriggerProps
    extends OverlayTriggerProps<DialogHandle, unknown> {
    disabled?: boolean;
}

export const DialogTrigger: PartComponent<
    DialogTriggerProps,
    DialogTriggerState
> = publicComponent(
    defineComponent({
        name: "DialogTrigger",
        inheritAttrs: false,
        props: {
            ...asProp,
            ...overlayTriggerProps,
            handle: {
                type: Object as PropType<DialogHandle>,
                default: undefined,
            },
            disabled: { type: Boolean, default: false },
        },
        setup(props, { attrs, slots }) {
            const trigger = useOverlayTrigger(
                DialogKey,
                "Dialog.Trigger",
                props,
            );
            const setTrigger = elementSetter(trigger.element);
            return () => {
                const root = trigger.root.value;
                const active = trigger.active.value;
                // named by its Root (an AlertDialog's parts are Dialog's), or its handle before
                // one attaches
                const component =
                    root?.component ??
                    (props.handle as { component?: string } | undefined)
                        ?.component ??
                    "dialog";
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
                    { open: active, disabled: props.disabled },
                    {
                        type: "button",
                        id: trigger.id.value,
                        disabled: props.disabled,
                        "aria-haspopup": "dialog",
                        "aria-expanded": active ? "true" : "false",
                        "aria-controls": active ? root?.popupId : undefined,
                        "data-primitives-part": `${component}-trigger`,
                        ...stateAttributes({
                            "popup-open": active,
                            disabled: props.disabled,
                        }),
                        onClick: (event: MouseEvent) =>
                            root?.setOpen(
                                !active,
                                "trigger-press",
                                event,
                                event.currentTarget as HTMLElement,
                            ),
                        ref: setTrigger,
                    },
                );
            };
        },
    }),
);
