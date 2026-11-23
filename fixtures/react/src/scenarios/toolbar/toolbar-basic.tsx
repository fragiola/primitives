import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Toggle } from "../../kit/ui/toggle.tsx";
import { ToggleGroup } from "../../kit/ui/toggle-group.tsx";
import { Toolbar } from "../../kit/ui/toolbar.tsx";

/** spec/toolbar.md, `/toolbar/basic` (and `?dir=rtl`) */
export function ToolbarBasic() {
    const [style, setStyle] = useState<string[]>();
    const [pressed, setPressed] = useState<string>();
    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <button type="button">Before</button>
                <Toolbar.Root aria-label="Formatting">
                    <ToggleGroup
                        aria-label="Text style"
                        multiple
                        onValueChange={(next: string[]) => setStyle(next)}
                    >
                        <Toggle value="bold">Bold</Toggle>
                        <Toggle value="italic">Italic</Toggle>
                    </ToggleGroup>
                    <Toolbar.Separator />
                    <Toolbar.Group aria-label="History">
                        <Toolbar.Button onClick={() => setPressed("Undo")}>
                            Undo
                        </Toolbar.Button>
                        <Toolbar.Button
                            disabled
                            onClick={() => setPressed("Redo")}
                        >
                            Redo
                        </Toolbar.Button>
                    </Toolbar.Group>
                    <Toolbar.Separator />
                    <Toolbar.Button
                        disabled
                        focusableWhenDisabled
                        onClick={() => setPressed("Share")}
                    >
                        Share
                    </Toolbar.Button>
                    <Toolbar.Link href="#help">Help</Toolbar.Link>
                    <Toolbar.Input aria-label="Search" defaultValue="draft" />
                </Toolbar.Root>
                <button type="button">After</button>
            </div>
            <Output values={{ style: style?.join(","), pressed }} />
        </>
    );
}
