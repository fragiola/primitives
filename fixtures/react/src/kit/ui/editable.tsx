import { Editable as Primitive } from "@fragiola/primitives-react/editable";
import { editable } from "examples-shared/recipes/editable";
import type { ComponentProps } from "react";

function Icon({ d }: { d: string }) {
    return (
        <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path d={d} />
        </svg>
    );
}

export const Editable = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={editable.root} {...props} />
    ),
    Area: (props: ComponentProps<typeof Primitive.Area>) => (
        <Primitive.Area className={editable.area} {...props} />
    ),
    Preview: (props: ComponentProps<typeof Primitive.Preview>) => (
        <Primitive.Preview className={editable.preview} {...props} />
    ),
    Input: (props: ComponentProps<typeof Primitive.Input>) => (
        <Primitive.Input className={editable.input} {...props} />
    ),
    /** The styled triggers, each with its icon (a pencil, a check, a cross). */
    EditTrigger: (props: ComponentProps<typeof Primitive.EditTrigger>) => (
        <Primitive.EditTrigger className={editable["edit-trigger"]} {...props}>
            <Icon d="M4 20h4L19 9l-4-4L4 16v4z" />
        </Primitive.EditTrigger>
    ),
    SubmitTrigger: (props: ComponentProps<typeof Primitive.SubmitTrigger>) => (
        <Primitive.SubmitTrigger
            className={editable["submit-trigger"]}
            {...props}
        >
            <Icon d="M5 12l5 5L20 7" />
        </Primitive.SubmitTrigger>
    ),
    CancelTrigger: (props: ComponentProps<typeof Primitive.CancelTrigger>) => (
        <Primitive.CancelTrigger
            className={editable["cancel-trigger"]}
            {...props}
        >
            <Icon d="M6 6l12 12M18 6L6 18" />
        </Primitive.CancelTrigger>
    ),
};
