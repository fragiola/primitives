import { ScrollArea } from "../../kit/ui/scroll-area.tsx";

const CHAPTERS = Array.from({ length: 20 }, (_, index) => index + 1);

/** spec/scroll-area.md, `/scroll-area/links` */
export function ScrollAreaLinks() {
    return (
        <div className="flex flex-col items-start gap-4">
            <div className="h-48 w-64">
                <ScrollArea.Root>
                    <ScrollArea.Viewport role="region" aria-label="Chapters">
                        <ScrollArea.Content>
                            {CHAPTERS.map((chapter) => (
                                <a key={chapter} href={`#chapter-${chapter}`}>
                                    Chapter {chapter}
                                </a>
                            ))}
                        </ScrollArea.Content>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar orientation="vertical" />
                </ScrollArea.Root>
            </div>
            <button type="button">After</button>
        </div>
    );
}
