import type { InjectionKey } from "vue";
import type { ChangeDetails } from "../../utils/change-details.ts";

/** What the Root renders with (spec/carousel.md). */
export interface CarouselState {
    /** The current page, from 0. */
    page: number;
    /** The number of pages. */
    pageCount: number;
    orientation: "horizontal" | "vertical";
    /** The slides rotate. */
    playing: boolean;
    /** A hover pauses the rotation. */
    paused: boolean;
    /** A mouse drag runs. */
    dragging: boolean;
}

export interface CarouselContext {
    state: () => CarouselState;
    /** Each page's first slide. */
    pages: () => readonly number[];
    /** The slides in view. */
    inView: () => ReadonlySet<number>;
    loop: () => boolean;
    variant: () => "basic" | "tabbed";
    /** The group holds nothing Tab reaches: it takes a tab stop of its own. */
    groupTabStop: () => boolean;
    baseId: string;
    setPage: (page: number, details: ChangeDetails) => void;
    setPlaying: (playing: boolean, details: ChangeDetails) => void;
    setGroup: (element: unknown) => void;
}

export const CarouselKey: InjectionKey<CarouselContext> = Symbol("Carousel");

export const carouselGroupId = (baseId: string) => `${baseId}-items`;
export const carouselSlideId = (baseId: string, index: number) =>
    `${baseId}-slide-${index}`;
export const carouselIndicatorId = (baseId: string, index: number) =>
    `${baseId}-indicator-${index}`;
