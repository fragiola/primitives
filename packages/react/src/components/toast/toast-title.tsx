import { useId, useLayoutEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToastRootContext } from "./toast-context.ts";

/** The toast's title (its Root's `aria-labelledby`); its children default to the toast's `title`. */
export function ToastTitle(props: PartProps<{ type: string | undefined }>) {
    const context = useRequiredContext(ToastRootContext, "Toast.Title");
    const generated = useId();
    const id = (props.id as string | undefined) ?? generated;
    const { setTitleId } = context;
    useLayoutEffect(() => {
        setTitleId(id);
        return () => setTitleId(undefined);
    }, [id, setTitleId]);
    const { children, ...rest } = props;
    return renderElement(
        "h2",
        { ...rest, children: children ?? context.toast.title },
        { type: context.toast.type },
        {
            id,
            "data-primitives-part": "toast-title",
            ...stateAttributes({ type: context.toast.type }),
        },
    );
}
