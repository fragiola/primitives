import {
    computed,
    defineComponent,
    inject,
    onBeforeUnmount,
    type PropType,
    provide,
    ref,
    shallowReactive,
    shallowRef,
    watch,
} from "vue";
import {
    type OverlayRootEmits,
    type OverlayRootProps,
    type OverlayTriggerRootProps,
    overlayRootEmits,
    overlayRootProps,
    overlayTriggerRootProps,
    useOverlayRoot,
} from "../../composables/use-overlay-root.ts";
import { useAttachHandle } from "../../composables/use-overlay-trigger.ts";
import {
    type OverlayRootSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type DialogContext,
    DialogKey,
    type DialogNesting,
    DialogNestingKey,
} from "./dialog-context.ts";
import type { DialogHandle } from "./dialog-handle.ts";

/**
 * Holds the dialog's state (`v-model:open`); renders no element (spec/dialog.md). A template ref
 * on it exposes the actions, `close()` and `unmount()`.
 */
export interface DialogRootProps
    extends OverlayRootProps,
        OverlayTriggerRootProps {
    /** Connects Triggers rendered outside the Root (spec/dialog.md, "Detached triggers"). */
    handle?: DialogHandle;
}

export type DialogRootEmits = OverlayRootEmits;

export const DialogRoot: PublicComponent<
    DialogRootProps,
    OverlayRootSlots,
    DialogRootEmits
> = publicComponent(
    defineComponent({
        name: "DialogRoot",
        props: {
            ...overlayRootProps,
            ...overlayTriggerRootProps,
            handle: {
                type: Object as PropType<DialogHandle>,
                default: undefined,
            },
        },
        emits: overlayRootEmits,
        setup(props, { emit, slots, expose }) {
            const root = useOverlayRoot(props, emit);

            // nested dialogs (spec/dialog.md, "Nested dialogs"): a dialog inside another's Popup
            // reports the open chain below it; this one counts the longest chain nested in it
            const parent = inject(DialogNestingKey, null);
            const chains = shallowReactive(new Map<symbol, number>());
            const nestedDialogs = computed(() =>
                Math.max(0, ...chains.values()),
            );
            const nesting: DialogNesting = {
                report(id, chain) {
                    if (chain === null) {
                        chains.delete(id);
                    } else {
                        chains.set(id, chain);
                    }
                },
            };
            if (parent !== null) {
                const id = Symbol("NestedDialog");
                watch(
                    () => (root.open.value ? 1 + nestedDialogs.value : 0),
                    (chain) => parent.report(id, chain),
                    { immediate: true },
                );
                onBeforeUnmount(() => parent.report(id, null));
            }

            const context: DialogContext = {
                ...root,
                backdrop: shallowRef(null),
                viewport: shallowRef(null),
                titleId: ref(),
                descriptionId: ref(),
                nested: parent !== null,
                nestedDialogs,
                nesting,
            };
            provide(DialogKey, context);
            useAttachHandle(() => props.handle, context);
            expose(root.actions);
            return () => slots.default?.({ payload: root.payload.value });
        },
    }),
);
