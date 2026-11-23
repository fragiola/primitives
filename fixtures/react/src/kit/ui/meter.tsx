import { Meter as Primitive } from "@fragiola/primitives-react/meter";
import { meter } from "examples-shared/recipes/meter";
import type { ComponentProps } from "react";

export const Meter = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={meter.root} {...props} />
    ),
    Label: (props: ComponentProps<typeof Primitive.Label>) => (
        <Primitive.Label className={meter.label} {...props} />
    ),
    Value: (props: ComponentProps<typeof Primitive.Value>) => (
        <Primitive.Value className={meter.value} {...props} />
    ),
    /** The styled track, with its indicator. */
    Track: (props: ComponentProps<typeof Primitive.Track>) => (
        <Primitive.Track className={meter.track} {...props}>
            <Primitive.Indicator className={meter.indicator} />
        </Primitive.Track>
    ),
};
