import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Switch } from "../../kit/ui/switch.tsx";

export function SwitchBasic() {
    const [wifi, setWifi] = useState<boolean>();
    const [form, setForm] = useState<string>();
    return (
        <>
            <form
                className="flex flex-col items-start gap-2"
                onSubmit={(event) => {
                    event.preventDefault();
                    setForm(formEntries(event.currentTarget));
                }}
            >
                <label className="flex items-center gap-2 text-sm">
                    <Switch.Root
                        name="wifi"
                        defaultChecked
                        onCheckedChange={(checked: boolean) => setWifi(checked)}
                    />
                    Wi-Fi
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <Switch.Root
                        name="bluetooth"
                        value="yes"
                        uncheckedValue="no"
                    />
                    Bluetooth
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <Switch.Root name="terms" required />
                    Accept terms
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <Switch.Root name="location" defaultChecked readOnly />
                    Location
                </label>
                <label className="flex items-center gap-2 text-sm">
                    <Switch.Root disabled />
                    Airplane mode
                </label>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ wifi, form }} />
        </>
    );
}
