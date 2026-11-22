import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { FruitSelect } from "./fruit-select.tsx";

/** spec/select.md, `/select/modal`: scroll lock and a blocked outside pointer while open. */
export function SelectModal() {
    const [value, setValue] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState<string>();
    const [outside, setOutside] = useState<string>();
    return (
        <div className="h-[200vh]">
            <div className="flex items-end gap-2">
                <div className="flex flex-col items-start gap-2">
                    <label htmlFor="fruit" className="text-sm font-medium">
                        Fruit
                    </label>
                    <FruitSelect
                        id="fruit"
                        modal
                        onValueChange={setValue}
                        onOpenChange={(next, why) => {
                            setOpen(next);
                            setReason(why);
                        }}
                    />
                </div>
                <button type="button" onClick={() => setOutside("pressed")}>
                    Outside button
                </button>
            </div>
            <Output values={{ value, open, reason, outside }} />
        </div>
    );
}
