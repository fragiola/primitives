import { PasswordInput as Primitive } from "@fragiola/primitives-react/password-input";
import { passwordInput } from "examples-shared/recipes/password-input";
import type { ComponentProps } from "react";

export const PasswordInput = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={passwordInput.root} {...props} />
    ),
    Input: (props: ComponentProps<typeof Primitive.Input>) => (
        <Primitive.Input className={passwordInput.input} {...props} />
    ),
    /** The styled trigger, with its eye icons (the recipe shows one by `data-visible`). */
    VisibilityTrigger: (
        props: ComponentProps<typeof Primitive.VisibilityTrigger>,
    ) => (
        <Primitive.VisibilityTrigger
            className={passwordInput["visibility-trigger"]}
            {...props}
        >
            <svg
                className={passwordInput.show}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
            >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
                className={passwordInput.hide}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
            >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <path d="M3 3l18 18" />
            </svg>
        </Primitive.VisibilityTrigger>
    ),
};
