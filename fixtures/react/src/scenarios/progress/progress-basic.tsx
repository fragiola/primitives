import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Progress } from "../../kit/ui/progress.tsx";

const GIGABYTES = { style: "unit", unit: "gigabyte" } as const;

export function ProgressBasic() {
    const [value, setValue] = useState<number | null>(40);
    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <Progress.Root value={value} locale="en-US">
                    <Progress.Label>Upload</Progress.Label>
                    <Progress.Value />
                    <Progress.Track />
                </Progress.Root>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setValue(100)}>
                        Complete
                    </button>
                    <button type="button" onClick={() => setValue(null)}>
                        Unknown
                    </button>
                </div>
                <Progress.Root
                    value={128}
                    min={0}
                    max={512}
                    format={GIGABYTES}
                    locale="en-US"
                >
                    <Progress.Label>Storage</Progress.Label>
                    <Progress.Value />
                    <Progress.Track />
                </Progress.Root>
            </div>
            <Output values={{ value }} />
        </>
    );
}
