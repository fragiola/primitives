/** A box and a point, as `getBoundingClientRect()` and a pointer event give them. */
interface Box {
    left: number;
    top: number;
    width: number;
    height: number;
}

/**
 * The hue at a point of a ColorWheel (spec/color-wheel.md, "Pointer"): its angle around the box's
 * centre, 0° at the top, clockwise, in `[0, 360)`.
 */
export function hueAtPoint(box: Box, point: { x: number; y: number }): number {
    const dx = point.x - (box.left + box.width / 2);
    const dy = point.y - (box.top + box.height / 2);
    const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI;
    return (degrees + 360) % 360;
}

/** Whether a point lies on a ColorWheel's ring: between the inner and the outer radius (px). */
export function isOnColorWheel(
    box: Box,
    point: { x: number; y: number },
    innerRadius: number,
    outerRadius: number,
): boolean {
    const dx = point.x - (box.left + box.width / 2);
    const dy = point.y - (box.top + box.height / 2);
    const distance = Math.hypot(dx, dy);
    return distance >= innerRadius && distance <= outerRadius;
}

/**
 * Where a ColorWheel's thumb sits for `hue`: its offset (px) from the wheel's centre, on the
 * circle of `radius` (the ring's middle), 0° at the top, clockwise.
 */
export function colorWheelThumbOffset(
    hue: number,
    radius: number,
): { x: number; y: number } {
    const radians = (hue * Math.PI) / 180;
    const round = (value: number) => Math.round(value * 100) / 100 + 0;
    return {
        x: round(radius * Math.sin(radians)),
        y: round(-radius * Math.cos(radians)),
    };
}
