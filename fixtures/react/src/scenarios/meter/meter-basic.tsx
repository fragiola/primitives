import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Meter } from "../../kit/ui/meter.tsx";

const GIGABYTES = { style: "unit", unit: "gigabyte" } as const;

/** spec/meter.md, `/meter/basic` (and `?dir=rtl`) */
export function MeterBasic() {
    const [value, setValue] = useState(60);
    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <Meter.Root value={value} locale="en-US">
                    <Meter.Label>Battery</Meter.Label>
                    <Meter.Value />
                    <Meter.Track />
                </Meter.Root>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setValue(10)}>
                        Drain
                    </button>
                    <button type="button" onClick={() => setValue(140)}>
                        Overcharge
                    </button>
                </div>
                <Meter.Root
                    value={384}
                    max={512}
                    format={GIGABYTES}
                    locale="en-US"
                >
                    <Meter.Label>Storage</Meter.Label>
                    <Meter.Value />
                    <Meter.Track />
                </Meter.Root>
            </div>
            <Output values={{ value }} />
        </>
    );
}
