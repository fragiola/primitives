import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { AutocompleteContext } from "./autocomplete-context.ts";

export interface AutocompleteValueProps {
    /** A node, or a render function of the value (the text). */
    children?: ReactNode | ((value: string) => ReactNode);
}

/** Renders the value: the text, or the consumer's render function of it. */
export function AutocompleteValue({ children }: AutocompleteValueProps) {
    const context = useRequiredContext(
        AutocompleteContext,
        "Autocomplete.Value",
    );
    if (typeof children === "function") {
        return <>{children(context.value)}</>;
    }
    if (children !== undefined) {
        return <>{children}</>;
    }
    return <>{context.value}</>;
}
