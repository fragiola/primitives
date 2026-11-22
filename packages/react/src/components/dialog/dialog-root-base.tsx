import {
    type ReactNode,
    useCallback,
    useContext,
    useId,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";
import {
    type OverlayRootProps,
    type OverlayTriggerRootProps,
    useOverlayRoot,
} from "../../hooks/use-overlay-root.ts";
import { useAttachHandle } from "../../hooks/use-overlay-trigger.ts";
import type { OverlayHandle } from "../../utils/overlay-handle.ts";
import {
    type DialogComponent,
    DialogContext,
    type DialogNesting,
    DialogNestingContext,
} from "./dialog-context.ts";

/** What a Dialog's or an AlertDialog's Root shares. */
export interface DialogRootSharedProps<Payload = unknown>
    extends OverlayRootProps,
        OverlayTriggerRootProps {
    /** The content, or a function of the active trigger's payload. */
    children?:
        | ReactNode
        | ((state: { payload: Payload | undefined }) => ReactNode);
}

/**
 * The Root of a Dialog or of an AlertDialog (spec/alert-dialog.md: built on Dialog's parts), the
 * part attributes of its parts named by `component`; renders no element.
 */
export function DialogRootBase<Payload = unknown>({
    children,
    handle,
    component,
    ...props
}: DialogRootSharedProps<Payload> & {
    handle?: OverlayHandle<Payload> | undefined;
    component: DialogComponent;
}) {
    const root = useOverlayRoot(props);
    const [backdrop, setBackdrop] = useState<HTMLElement | null>(null);
    const [viewport, setViewport] = useState<HTMLElement | null>(null);
    const [titleId, setTitleId] = useState<string>();
    const [descriptionId, setDescriptionId] = useState<string>();

    // nested dialogs (spec/dialog.md, "Nested dialogs"): a dialog inside another's Popup reports
    // the open chain below it; this one counts the longest chain of the dialogs nested in it
    const parent = useContext(DialogNestingContext);
    const nestingId = useId();
    const [chains, setChains] = useState<ReadonlyMap<string, number>>(
        () => new Map(),
    );
    const nestedDialogs = Math.max(0, ...chains.values());
    const report = useCallback((id: string, chain: number | null) => {
        setChains((previous) => {
            if (
                chain === null ? !previous.has(id) : previous.get(id) === chain
            ) {
                return previous;
            }
            const next = new Map(previous);
            if (chain === null) {
                next.delete(id);
            } else {
                next.set(id, chain);
            }
            return next;
        });
    }, []);
    const nesting: DialogNesting = useMemo(() => ({ report }), [report]);
    const { open } = root;
    useLayoutEffect(() => {
        if (parent === null) {
            return undefined;
        }
        parent.report(nestingId, open ? 1 + nestedDialogs : 0);
        return () => parent.report(nestingId, null);
    }, [parent, nestingId, open, nestedDialogs]);

    const value = useMemo(
        () => ({
            ...root,
            component,
            backdrop,
            setBackdrop,
            viewport,
            setViewport,
            titleId,
            setTitleId,
            descriptionId,
            setDescriptionId,
            nested: parent !== null,
            nestedDialogs,
            nesting,
        }),
        [
            root,
            component,
            backdrop,
            viewport,
            titleId,
            descriptionId,
            parent,
            nestedDialogs,
            nesting,
        ],
    );
    useAttachHandle(handle as OverlayHandle<never> | undefined, value);
    return (
        <DialogContext.Provider value={value}>
            {typeof children === "function"
                ? children({ payload: root.payload as Payload | undefined })
                : children}
        </DialogContext.Provider>
    );
}
