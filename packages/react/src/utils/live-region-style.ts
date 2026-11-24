/**
 * A polite live region's structural style (spec/drop-zone.md, spec/file-upload.md): visually
 * hidden, still read; Clipboard's announcer's.
 */
export const LIVE_REGION_STYLE = {
    position: "absolute",
    width: "1px",
    height: "1px",
    margin: "-1px",
    padding: "0",
    border: "0",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
} as const;
