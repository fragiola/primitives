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
import {
    DialogContext,
    type DialogNesting,
    DialogNestingContext,
} from "./dialog-context.ts";
import type { DialogHandle } from "./dialog-handle.ts";

export interface DialogRootProps<Payload = unknown>
    extends OverlayRootProps,
        OverlayTriggerRootProps {
    /** Connects Triggers rendered outside the Root (spec/dialog.md, "Detached triggers"). */
    handle?: DialogHandle<Payload>;
    /** The content, or a function of the active trigger's payload. */
    children?:
        | ReactNode
        | ((state: { payload: Payload | undefined }) => ReactNode);
}

/** Holds the dialog's state; renders no element (spec/dialog.md). */
export function DialogRoot<Payload = unknown>({
    children,
    handle,
    ...props
}: DialogRootProps<Payload>) {
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
            backdrop,
            viewport,
            titleId,
            descriptionId,
            parent,
            nestedDialogs,
            nesting,
        ],
    );
    useAttachHandle(handle, value);
    return (
        <DialogContext.Provider value={value}>
            {typeof children === "function"
                ? children({ payload: root.payload as Payload | undefined })
                : children}
        </DialogContext.Provider>
    );
}
