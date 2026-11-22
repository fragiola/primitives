import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { ComboboxContext } from "./combobox-context.ts";

export interface ComboboxValueProps<Value = unknown> {
    /**
     * A node, or a render function of the value (an item or `null`, or the list of items). `Value`
     * is the consumer's own type, inferred from the function's parameter.
     */
    children?: ReactNode | ((value: Value) => ReactNode);
}

/** Renders the value: its label (labels joined with ", "), or the consumer's render function. */
export function ComboboxValue<Value = unknown>({
    children,
}: ComboboxValueProps<Value>) {
    const context = useRequiredContext(ComboboxContext, "Combobox.Value");
    if (typeof children === "function") {
        // the Root holds the consumer's items: the render function names their type
        return <>{children(context.value as Value)}</>;
    }
    if (children !== undefined) {
        return <>{children}</>;
    }
    return <>{context.values.map(context.label).join(", ")}</>;
}
