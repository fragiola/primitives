import { watchLongPress } from "@fragiola/primitives/pointer";
import { defineComponent, shallowRef, watch } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { MenuKey } from "../menu/menu-context.ts";
import { ContextMenuKey } from "./context-menu-context.ts";

/**
 * The area a right-click, a touch long press, or the `ContextMenu` key and Shift+F10 open the
 * menu from (spec/context-menu.md): no button, no role.
 */
export interface ContextMenuTriggerState {
    open: boolean;
    disabled: boolean;
}

// The keyboard's own `contextmenu` event follows the key that opened the menu within this time.
const KEYBOARD_EVENT_WINDOW = 300;

/** A key that opens a context menu from the keyboard (spec/context-menu.md, "Keyboard"). */
function isMenuKey(event: KeyboardEvent): boolean {
    return (
        event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)
    );
}

export const ContextMenuTrigger: PartComponent<
    Record<never, never>,
    ContextMenuTriggerState
> = publicComponent(
    defineComponent({
        name: "ContextMenuTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const menu = useRequiredContext(MenuKey, "ContextMenu.Trigger");
            const context = useRequiredContext(
                ContextMenuKey,
                "ContextMenu.Trigger",
            );
            const element = shallowRef<HTMLElement | null>(null);
            let keyboardAt = Number.NEGATIVE_INFINITY;
            const setElement = (value: unknown) => {
                const node =
                    value instanceof HTMLElement
                        ? value
                        : ((value as { $el?: HTMLElement } | null)?.$el ??
                          null);
                if (element.value !== node) {
                    element.value = node;
                }
                // the area is the root level's trigger: what it was opened from
                if (menu.trigger.value !== node) {
                    menu.trigger.value = node;
                }
            };
            const inArea = (target: EventTarget | null) =>
                element.value !== null &&
                target instanceof Node &&
                element.value.contains(target);

            // a touch held still for 500 ms opens it at the press point
            watch(
                () => [element.value, context.disabled()] as const,
                ([node, disabled], _, onCleanup) => {
                    if (node === null || disabled) {
                        return;
                    }
                    onCleanup(
                        watchLongPress(node, {
                            onLongPress: (point, event) =>
                                context.openAt(
                                    point,
                                    "trigger-press",
                                    event,
                                    node,
                                    null,
                                ),
                        }),
                    );
                },
                { immediate: true, flush: "post" },
            );

            return () => {
                const open = menu.open.value;
                const disabled = context.disabled();
                return renderPart(
                    "div",
                    { attrs, slots },
                    props.as,
                    { open, disabled },
                    {
                        "data-primitives-part": "context-menu-trigger",
                        ...stateAttributes({ "popup-open": open, disabled }),
                        onContextmenu: (event: MouseEvent) => {
                            const node = element.value;
                            if (
                                context.disabled() ||
                                node === null ||
                                !inArea(event.target)
                            ) {
                                return;
                            }
                            event.preventDefault();
                            // the browser's own event after a key that already opened the menu
                            if (
                                event.timeStamp - keyboardAt <
                                KEYBOARD_EVENT_WINDOW
                            ) {
                                return;
                            }
                            context.openAt(
                                { x: event.clientX, y: event.clientY },
                                "trigger-press",
                                event,
                                node,
                                null,
                            );
                        },
                        onKeydown: (event: KeyboardEvent) => {
                            const node = element.value;
                            if (
                                context.disabled() ||
                                node === null ||
                                !isMenuKey(event) ||
                                !inArea(event.target)
                            ) {
                                return;
                            }
                            event.preventDefault();
                            keyboardAt = event.timeStamp;
                            const focused = node.ownerDocument.activeElement;
                            context.openAt(
                                focused !== null && node.contains(focused)
                                    ? focused
                                    : node,
                                "list-navigation",
                                event,
                                node,
                                "first",
                            );
                        },
                        onKeyup: (event: KeyboardEvent) => {
                            // some platforms send the menu key's `contextmenu` on its release
                            if (
                                !context.disabled() &&
                                isMenuKey(event) &&
                                inArea(event.target)
                            ) {
                                keyboardAt = event.timeStamp;
                            }
                        },
                        ref: setElement,
                    },
                );
            };
        },
    }),
);
