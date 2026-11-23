import { SearchField as Primitive } from "@fragiola/primitives-react/search-field";
import { searchField } from "examples-shared/recipes/search-field";
import type { ComponentProps } from "react";

export const SearchField = {
    /** The styled Root, with its search icon before its parts. */
    Root: ({ children, ...props }: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={searchField.root} {...props}>
            <svg
                className={searchField.icon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
            >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
            </svg>
            {children}
        </Primitive.Root>
    ),
    Input: (props: ComponentProps<typeof Primitive.Input>) => (
        <Primitive.Input className={searchField.input} {...props} />
    ),
    /** The styled button, with its cross icon. */
    ClearButton: (props: ComponentProps<typeof Primitive.ClearButton>) => (
        <Primitive.ClearButton
            className={searchField["clear-button"]}
            {...props}
        >
            <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
            >
                <path d="M6 6l12 12M18 6L6 18" />
            </svg>
        </Primitive.ClearButton>
    ),
};
