import { carousel } from "examples-shared/recipes/carousel";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Carousel } from "../../kit/ui/carousel.tsx";

const SLIDES = [1, 2, 3];

/** spec/carousel.md, `/carousel/autoplay` */
export function CarouselAutoplay() {
    const [page, setPage] = useState<number>();
    const [reason, setReason] = useState<string>();
    const [playing, setPlaying] = useState<boolean>();
    const [playingReason, setPlayingReason] = useState<string>();
    return (
        <>
            <Carousel.Root
                aria-label="Highlights"
                slideCount={SLIDES.length}
                defaultPlaying
                delay={3000}
                onPageChange={(next, details) => {
                    setPage(next);
                    setReason(details.reason);
                }}
                onPlayingChange={(next, details) => {
                    setPlaying(next);
                    setPlayingReason(details.reason);
                }}
            >
                <div className={carousel.controls}>
                    <Carousel.AutoplayTrigger>
                        {({ playing: rotating }) =>
                            rotating
                                ? "Stop slide rotation"
                                : "Start slide rotation"
                        }
                    </Carousel.AutoplayTrigger>
                    <Carousel.PrevTrigger aria-label="Previous slide">
                        ‹
                    </Carousel.PrevTrigger>
                    <Carousel.NextTrigger aria-label="Next slide">
                        ›
                    </Carousel.NextTrigger>
                </div>
                <Carousel.ItemGroup>
                    {SLIDES.map((slide, index) => (
                        <Carousel.Item
                            key={slide}
                            index={index}
                            aria-label={`${slide} of ${SLIDES.length}`}
                        >
                            <div className={carousel.slide}>Slide {slide}</div>
                        </Carousel.Item>
                    ))}
                </Carousel.ItemGroup>
            </Carousel.Root>
            <Output values={{ page, reason, playing, playingReason }} />
        </>
    );
}
