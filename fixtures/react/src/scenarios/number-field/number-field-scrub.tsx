import { Output } from "../../kit/output.tsx";
import { Label } from "../../kit/ui/label.tsx";
import { NumberField } from "../../kit/ui/number-field.tsx";
import { useNumberOutput } from "./use-number-output.ts";

/** spec/number-field.md, `/number-field/scrub` */
export function NumberFieldScrub() {
    const output = useNumberOutput();
    return (
        <>
            <NumberField.Root
                id="width"
                defaultValue={100}
                allowWheelScrub
                locale="en-US"
                onValueChange={output.onValueChange}
            >
                <NumberField.ScrubArea data-testid="scrub">
                    <Label htmlFor="width">Width</Label>
                    <NumberField.ScrubAreaCursor />
                </NumberField.ScrubArea>
                <NumberField.Group>
                    <NumberField.Input />
                </NumberField.Group>
            </NumberField.Root>
            <Output values={output.values} />
        </>
    );
}
