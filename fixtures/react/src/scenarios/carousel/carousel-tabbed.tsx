import { carousel } from "examples-shared/recipes/carousel";
import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Carousel } from "../../kit/ui/carousel.tsx";

const SLIDES = [1, 2, 3];

/** spec/carousel.md, `/carousel/tabbed` */
export function CarouselTabbed() {
    const [page, setPage] = useState<number>();
    const [reason, setReason] = useState<string>();
    return (
        <>
            <Carousel.Root
                aria-label="Features"
                variant="tabbed"
                slideCount={SLIDES.length}
                onPageChange={(next, details) => {
                    setPage(next);
                    setReason(details.reason);
                }}
            >
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
                <Carousel.IndicatorGroup aria-label="Choose slide to display">
                    {SLIDES.map((slide, index) => (
                        <Carousel.Indicator
                            key={slide}
                            index={index}
                            aria-label={`Slide ${slide}`}
                        />
                    ))}
                </Carousel.IndicatorGroup>
            </Carousel.Root>
            <Output values={{ page, reason }} />
        </>
    );
}
