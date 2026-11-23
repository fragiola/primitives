import { carousel } from "examples-shared/recipes/carousel";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Carousel } from "../../kit/ui/carousel.tsx";

const SLIDES = [1, 2, 3];

/** spec/carousel.md, `/carousel/vertical` */
export function CarouselVertical() {
    const [page, setPage] = useState<number>();
    const [reason, setReason] = useState<string>();
    return (
        <>
            <Carousel.Root
                aria-label="Stories"
                orientation="vertical"
                slideCount={SLIDES.length}
                loop
                onPageChange={(next, details) => {
                    setPage(next);
                    setReason(details.reason);
                }}
            >
                <Carousel.ItemGroup
                    className={`${carousel.itemGroup} ${carousel.vertical}`}
                >
                    {SLIDES.map((slide, index) => (
                        <Carousel.Item
                            key={slide}
                            index={index}
                            aria-label={`${slide} of ${SLIDES.length}`}
                        >
                            <div className={carousel.verticalSlide}>
                                Slide {slide}
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel.ItemGroup>
                <div className={carousel.controls}>
                    <Carousel.PrevTrigger aria-label="Previous slide">
                        ‹
                    </Carousel.PrevTrigger>
                    <Carousel.NextTrigger aria-label="Next slide">
                        ›
                    </Carousel.NextTrigger>
                </div>
            </Carousel.Root>
            <Output values={{ page, reason }} />
        </>
    );
}
