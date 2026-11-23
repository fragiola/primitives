import { useState } from "react";
import { ScrollArea } from "../../kit/ui/scroll-area.tsx";

/** The changelog's lines: release 1.40 first, each wider than the area. */
const RELEASES = Array.from({ length: 40 }, (_, index) => 40 - index);

/** spec/scroll-area.md, `/scroll-area/basic` (and `?dir=rtl`) */
export function ScrollAreaBasic() {
    const [few, setFew] = useState(false);
    const [wide, setWide] = useState(false);
    const releases = few ? RELEASES.slice(0, 3) : RELEASES;
    return (
        <div className="flex flex-col items-start gap-4">
            <div className="flex gap-2">
                <button type="button" onClick={() => setFew(!few)}>
                    Toggle items
                </button>
                <button type="button" onClick={() => setWide(!wide)}>
                    Toggle width
                </button>
            </div>
            <div className={wide ? "h-48 w-[48rem]" : "h-48 w-64"}>
                <ScrollArea.Root>
                    <ScrollArea.Viewport role="region" aria-label="Changelog">
                        <ScrollArea.Content>
                            {releases.map((release) => (
                                <p key={release} className="whitespace-nowrap">
                                    Release 1.{release}: fixed the focus ring of
                                    nested menus and the scroll lock on touch
                                </p>
                            ))}
                        </ScrollArea.Content>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar orientation="vertical" />
                    <ScrollArea.Scrollbar orientation="horizontal" />
                    <ScrollArea.Corner />
                </ScrollArea.Root>
            </div>
            <div className="h-48 w-64">
                <ScrollArea.Root>
                    <ScrollArea.Viewport role="region" aria-label="Shortcuts">
                        <ScrollArea.Content>
                            <p>Ctrl+K: search</p>
                            <p>Ctrl+P: print</p>
                            <p>Ctrl+S: save</p>
                        </ScrollArea.Content>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar orientation="vertical" />
                    <ScrollArea.Scrollbar orientation="horizontal" />
                    <ScrollArea.Corner />
                </ScrollArea.Root>
            </div>
        </div>
    );
}
