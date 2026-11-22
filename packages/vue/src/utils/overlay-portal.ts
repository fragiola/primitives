import {
    h,
    onMounted,
    type PropType,
    type Ref,
    ref,
    type Slots,
    Teleport,
    type VNode,
} from "vue";

/** The props of every overlay's Portal (spec/README.md, "Lifecycle"). */
export interface OverlayPortalProps {
    /** Where the content goes (default: `body`). */
    container?: Element | string | null;
    /**
     * Keeps the content rendered while the overlay is closed (hidden), before its first opening
     * and after an exit ends (default `false`).
     */
    keepMounted?: boolean;
}

export const overlayPortalProps = {
    /** Where the content goes (default: `body`). */
    container: {
        type: [Object, String] as PropType<Element | string | null>,
        default: undefined,
    },
    /** Keeps the content rendered (hidden) while the overlay is closed (default `false`). */
    keepMounted: { type: Boolean, default: false },
};

/**
 * An overlay Portal's render: its content moved to `container` while the overlay is mounted
 * (open, or its exit running), or always with `keep-mounted`. Never on a server, nor while a page
 * hydrates: the content appears once the Portal is mounted (a server render has no portal).
 */
export function useOverlayPortal(
    mounted: Ref<boolean>,
    props: OverlayPortalProps,
    slots: Slots,
): () => VNode | null {
    const ready = ref(false);
    onMounted(() => {
        ready.value = true;
    });
    return () => {
        if (!ready.value || (!mounted.value && !props.keepMounted)) {
            return null;
        }
        return h(Teleport, { to: props.container ?? "body" }, [
            slots.default?.(),
        ]);
    };
}
