import { Component } from "@angular/core";
import {
    ScrollAreaContent,
    ScrollAreaRoot,
    ScrollAreaScrollbar,
    ScrollAreaThumb,
    ScrollAreaViewport,
} from "@fragiola/primitives-angular/scroll-area";
import { styles } from "./styles.ts";

const CHANNELS = Array.from(
    { length: 40 },
    (_, index) => `channel-${index + 1}`,
);

// A sidebar of channel links in a ScrollArea (spec/scroll-area.md): the list scrolls natively,
// the custom scrollbar follows it; a link takes the focus, so the viewport takes no tab stop.
@Component({
    selector: "example-sidebar-channels",
    imports: [
        ScrollAreaRoot,
        ScrollAreaViewport,
        ScrollAreaContent,
        ScrollAreaScrollbar,
        ScrollAreaThumb,
    ],
    template: `
        <nav aria-label="Channels" [class]="styles.sidebar">
            <div scrollAreaRoot [class]="styles.root">
                <div scrollAreaViewport [class]="styles.viewport">
                    <div scrollAreaContent [class]="styles.content">
                        @for (channel of channels; track channel) {
                            <a [href]="'#' + channel" [class]="styles.link"># {{ channel }}</a>
                        }
                    </div>
                </div>
                <div *scrollAreaScrollbar [class]="styles.scrollbar"><div scrollAreaThumb [class]="styles.thumb"></div></div>
            </div>
        </nav>
    `,
})
export default class SidebarChannels {
    protected readonly styles = styles;
    protected readonly channels = CHANNELS;
}
