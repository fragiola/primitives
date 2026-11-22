import { Button } from "@fragiola/primitives-react/button";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

// spec/button.md: while disabled, the consumer's handlers do not run
describe("Button", () => {
    it("runs the consumer's click handler only while enabled", () => {
        const onClick = vi.fn();
        const { rerender } = render(
            <Button disabled focusableWhenDisabled onClick={onClick}>
                Publish
            </Button>,
        );
        fireEvent.click(screen.getByRole("button"));
        expect(onClick).not.toHaveBeenCalled();
        rerender(<Button onClick={onClick}>Publish</Button>);
        fireEvent.click(screen.getByRole("button"));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it("prevents every key but Tab while disabled and focusable", () => {
        const onKeyDown = vi.fn();
        render(
            <Button disabled focusableWhenDisabled onKeyDown={onKeyDown}>
                Publish
            </Button>,
        );
        const button = screen.getByRole("button");
        expect(fireEvent.keyDown(button, { key: "Enter" })).toBe(false);
        expect(fireEvent.keyDown(button, { key: "Tab" })).toBe(true);
        expect(onKeyDown).not.toHaveBeenCalled();
    });

    it("clicks a non-native button on Enter's key down and on Space's key up", () => {
        const onClick = vi.fn();
        render(
            <Button nativeButton={false} render={<span />} onClick={onClick}>
                Archive
            </Button>,
        );
        const button = screen.getByRole("button");
        expect(button.tagName).toBe("SPAN");
        fireEvent.keyDown(button, { key: "Enter" });
        expect(onClick).toHaveBeenCalledTimes(1);
        // Space's key down does not scroll and does not click yet
        expect(fireEvent.keyDown(button, { key: " " })).toBe(false);
        expect(onClick).toHaveBeenCalledTimes(1);
        fireEvent.keyUp(button, { key: " " });
        expect(onClick).toHaveBeenCalledTimes(2);
    });
});
