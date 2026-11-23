import { useState } from "react";
import { AspectRatio } from "../../kit/ui/aspect-ratio.tsx";

/** A 16 by 9 picture, one color: the frame's ratio is what the scenario checks. */
const LAKE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%234a7a8c'/%3E%3C/svg%3E";

/** spec/aspect-ratio.md, `/aspect-ratio/basic` */
export function AspectRatioBasic() {
    const [wide, setWide] = useState(false);
    return (
        <div className="flex flex-col items-start gap-4">
            <div className={wide ? "w-[32rem]" : "w-80"}>
                <AspectRatio ratio={16 / 9}>
                    <img
                        src={LAKE}
                        alt="Mountain lake"
                        className="size-full object-cover"
                    />
                </AspectRatio>
            </div>
            <div className="w-40">
                <AspectRatio>
                    <div
                        role="img"
                        aria-label="Avatar placeholder"
                        className="size-full"
                    />
                </AspectRatio>
            </div>
            <button type="button" onClick={() => setWide(!wide)}>
                Widen
            </button>
        </div>
    );
}
