import {
    computed,
    type ExtractPropTypes,
    inject,
    onBeforeUnmount,
    provide,
    ref,
    type SetupContext,
    shallowReactive,
    shallowRef,
    watch,
} from "vue";
import {
    type overlayRootEmits,
    overlayRootProps,
    overlayTriggerRootProps,
    useOverlayRoot,
} from "../../composables/use-overlay-root.ts";
import { useAttachHandle } from "../../composables/use-overlay-trigger.ts";
import type { OverlayHandle } from "../../utils/overlay-handle.ts";
import {
    type DialogComponent,
    type DialogContext,
    DialogKey,
    type DialogNesting,
    DialogNestingKey,
} from "./dialog-context.ts";

/** The props a Dialog's and an AlertDialog's Root share (each declares its own `handle`). */
export const dialogRootProps = {
    ...overlayRootProps,
    ...overlayTriggerRootProps,
};

/**
 * The setup of a Dialog's or an AlertDialog's Root (spec/alert-dialog.md: built on Dialog's
 * parts), the part attributes of its parts named by `component`; renders no element.
 */
export function setupDialogRoot(
    component: DialogComponent,
    props: ExtractPropTypes<typeof dialogRootProps> & {
        handle?: OverlayHandle<never> | undefined;
    },
    {
        emit,
        slots,
        expose,
    }: Pick<SetupContext<typeof overlayRootEmits>, "emit" | "slots" | "expose">,
    /** Reads the open state (a Drawer resets its swipe and snap point on an opening). */
    withOpen?: (open: () => boolean) => void,
) {
    const root = useOverlayRoot(props, emit);
    withOpen?.(() => root.open.value);

    // nested dialogs (spec/dialog.md, "Nested dialogs"): a dialog inside another's Popup reports
    // the open chain below it; this one counts the longest chain nested in it
    const parent = inject(DialogNestingKey, null);
    const chains = shallowReactive(new Map<symbol, number>());
    const nestedDialogs = computed(() => Math.max(0, ...chains.values()));
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
        component,
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
}
