import { Progress as Primitive } from "@fragiola/primitives-react/progress";
import { progress } from "examples-shared/recipes/progress";
import type { ComponentProps } from "react";

export const Progress = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={progress.root} {...props} />
    ),
    Label: (props: ComponentProps<typeof Primitive.Label>) => (
        <Primitive.Label className={progress.label} {...props} />
    ),
    Value: (props: ComponentProps<typeof Primitive.Value>) => (
        <Primitive.Value className={progress.value} {...props} />
    ),
    /** The styled track, with its indicator. */
    Track: (props: ComponentProps<typeof Primitive.Track>) => (
        <Primitive.Track className={progress.track} {...props}>
            <Primitive.Indicator className={progress.indicator} />
        </Primitive.Track>
    ),
};
