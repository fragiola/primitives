import {
    DirectionProvider,
    useDirection,
} from "@fragiola/primitives-react/direction";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

afterEach(cleanup);

function Read() {
    return <output>{useDirection()}</output>;
}

// spec/direction.md: the public entry
describe("DirectionProvider", () => {
    it("reads ltr without a provider", () => {
        render(<Read />);
        expect(screen.getByRole("status").textContent).toBe("ltr");
    });

    it("gives its direction, and a nested provider wins", () => {
        const { container } = render(
            <DirectionProvider direction="rtl">
                <Read />
                <DirectionProvider direction="ltr">
                    <Read />
                </DirectionProvider>
            </DirectionProvider>,
        );
        expect(
            [...container.querySelectorAll("output")].map(
                (output) => output.textContent,
            ),
        ).toEqual(["rtl", "ltr"]);
    });

    it("defaults to ltr, and renders no element nor dir of its own", () => {
        const { container } = render(
            <DirectionProvider>
                <Read />
            </DirectionProvider>,
        );
        expect(container.innerHTML).toBe("<output>ltr</output>");
    });
});
