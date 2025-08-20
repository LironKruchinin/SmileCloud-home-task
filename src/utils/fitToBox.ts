/**
    * fitToBox.ts
    *
    * Utility function for scaling and translating arbitrary points into
    * a fixed-size square (default 800x800) with optional padding.
**/

import type { Point } from "./geometry";

const DEFAULT_SIZE = 800;
const DEFAULT_PADDING = 32;

export function fitToBox(
    points: Point[],
    size: number = DEFAULT_SIZE,
    padding: number = DEFAULT_PADDING
) {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);
    const scale = Math.min((size - 2 * padding) / width, (size - 2 * padding) / height);

    const mapX = (x: number) => (x - minX) * scale + padding;
    const mapY = (y: number) => (y - minY) * scale + padding;

    return {
        mapped: points.map((p) => ({ x: mapX(p.x), y: mapY(p.y) })),
        scale,
    };
}
