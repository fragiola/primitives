import { useId, useLayoutEffect } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ToastRootContext } from "./toast-context.ts";

/** The toast's description (its Root's `aria-describedby`); its children default to the toast's `description`. */
export function ToastDescription(
    props: PartProps<{ type: string | undefined }>,
) {
    const context = useRequiredContext(ToastRootContext, "Toast.Description");
    const generated = useId();
    const id = (props.id as string | undefined) ?? generated;
    const { setDescriptionId } = context;
    useLayoutEffect(() => {
        setDescriptionId(id);
        return () => setDescriptionId(undefined);
    }, [id, setDescriptionId]);
    const { children, ...rest } = props;
    return renderElement(
        "p",
        { ...rest, children: children ?? context.toast.description },
        { type: context.toast.type },
        {
            id,
            "data-primitives-part": "toast-description",
            ...stateAttributes({ type: context.toast.type }),
        },
    );
}
