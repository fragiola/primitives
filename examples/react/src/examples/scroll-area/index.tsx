import { ScrollArea } from "@fragiola/primitives-react/scroll-area";
import { styles } from "./styles.ts";

const CHANNELS = Array.from(
    { length: 40 },
    (_, index) => `channel-${index + 1}`,
);

// A sidebar of channel links in a ScrollArea (spec/scroll-area.md): the list scrolls natively,
// the custom scrollbar follows it; a link takes the focus, so the viewport takes no tab stop.
export default function SidebarChannels() {
    return (
        <nav aria-label="Channels" className={styles.sidebar}>
            <ScrollArea.Root className={styles.root}>
                <ScrollArea.Viewport className={styles.viewport}>
                    <ScrollArea.Content className={styles.content}>
                        {CHANNELS.map((channel) => (
                            <a
                                key={channel}
                                href={`#${channel}`}
                                className={styles.link}
                            >
                                # {channel}
                            </a>
                        ))}
                    </ScrollArea.Content>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar className={styles.scrollbar}>
                    <ScrollArea.Thumb className={styles.thumb} />
                </ScrollArea.Scrollbar>
            </ScrollArea.Root>
        </nav>
    );
}
