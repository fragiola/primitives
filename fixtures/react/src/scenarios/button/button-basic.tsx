import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Button } from "../../kit/ui/button.tsx";

export function ButtonBasic() {
    const [pressed, setPressed] = useState<string>();
    const [count, setCount] = useState(0);
    const press = (name: string) => () => {
        setPressed(name);
        setCount((current) => current + 1);
    };
    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <Button onClick={press("Save")}>Save</Button>
                <Button disabled onClick={press("Delete")}>
                    Delete
                </Button>
                <Button
                    disabled
                    focusableWhenDisabled
                    onClick={press("Publishing")}
                >
                    Publishing
                </Button>
                <Button
                    nativeButton={false}
                    render={<span />}
                    onClick={press("Archive")}
                >
                    Archive
                </Button>
                <Button
                    nativeButton={false}
                    render={<span />}
                    disabled
                    onClick={press("Locked")}
                >
                    Locked
                </Button>
            </div>
            <Output values={{ pressed, count }} />
        </>
    );
}
