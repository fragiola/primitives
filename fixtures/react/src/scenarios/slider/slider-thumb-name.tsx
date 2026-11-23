import { useState } from "react";
import { Slider } from "../../kit/ui/slider.tsx";

/** spec/slider.md, `/slider/thumb-name`: a bound Thumb name wins over the Label. */
export function SliderThumbName() {
    const [name, setName] = useState("Master volume");
    return (
        <div className="flex flex-col items-start gap-4">
            <Slider.Root defaultValue={50}>
                <Slider.Label>Volume</Slider.Label>
                <Slider.Control>
                    <Slider.Track>
                        <Slider.Indicator />
                        <Slider.Thumb aria-label={name} />
                    </Slider.Track>
                </Slider.Control>
            </Slider.Root>
            <button type="button" onClick={() => setName("Main volume")}>
                Rename
            </button>
        </div>
    );
}
