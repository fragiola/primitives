import { ScrollArea as Primitive } from "@fragiola/primitives-react/scroll-area";
import { scrollArea } from "examples-shared/recipes/scroll-area";
import type { ComponentProps } from "react";

export const ScrollArea = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={scrollArea.root} {...props} />
    ),
    Viewport: (props: ComponentProps<typeof Primitive.Viewport>) => (
        <Primitive.Viewport className={scrollArea.viewport} {...props} />
    ),
    Content: (props: ComponentProps<typeof Primitive.Content>) => (
        <Primitive.Content className={scrollArea.content} {...props} />
    ),
    /** The styled track, with its thumb. */
    Scrollbar: (props: ComponentProps<typeof Primitive.Scrollbar>) => (
        <Primitive.Scrollbar className={scrollArea.scrollbar} {...props}>
            <Primitive.Thumb className={scrollArea.thumb} />
        </Primitive.Scrollbar>
    ),
    Corner: (props: ComponentProps<typeof Primitive.Corner>) => (
        <Primitive.Corner className={scrollArea.corner} {...props} />
    ),
};
