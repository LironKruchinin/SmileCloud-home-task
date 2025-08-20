/**
 * geometry.ts
 *
 * Math utilities for triangle rendering.
 * - Defines Point and TriangleForm types.
 * - Provides default triangle coordinates.
 * - Functions for vector math (length, dot product, normalization).
 * - angleAtVertex: calculates internal angle at a vertex.
 * - angleArcPathAt: builds an SVG arc path for a given vertex angle.
 * - angleBisectorPoint: finds a label position inside the triangle.
 * - buildDisplayQuery / parseDisplayQuery: serialize & read vertices from URL.
 * - sideType / angleType: classify triangle by sides and angles.
 * - TRIANGLE_TYPE_HE: Hebrew translations for type labels.
 */

export type Point = { x: number; y: number };
export type TriangleForm = { a: Point; b: Point; c: Point };

export const DEFAULT_POINTS: TriangleForm = {
    a: { x: 100, y: 100 },
    b: { x: 700, y: 120 },
    c: { x: 420, y: 650 },
};

export const toDegrees = (radians: number) => (radians * 180) / Math.PI;

export const radToDeg = toDegrees;

const vectorBetween = (from: Point, to: Point): Point => ({ x: to.x - from.x, y: to.y - from.y });
const vectorLength = (v: Point) => Math.hypot(v.x, v.y);
const dotProduct = (u: Point, v: Point) => u.x * v.x + u.y * v.y;

const normalized = (v: Point): Point => {
    const length = vectorLength(v) || 1;
    return { x: v.x / length, y: v.y / length };
};

export function angleAtVertex(vertexA: Point, vertexB: Point, vertexC: Point): number {
    const ab = vectorBetween(vertexA, vertexB);
    const ac = vectorBetween(vertexA, vertexC);
    const cosTheta = dotProduct(ab, ac) / (vectorLength(ab) * vectorLength(ac));
    const clamped = Math.max(-1, Math.min(1, cosTheta));
    return Math.acos(clamped);
}

export function angleAt(a: Point, b: Point, c: Point) {
    return angleAtVertex(a, b, c);
}

export function angleArcPathAt(vertexA: Point, vertexB: Point, vertexC: Point, radius: number): string {
    const ab = vectorBetween(vertexA, vertexB);
    const ac = vectorBetween(vertexA, vertexC);

    let startAngle = Math.atan2(ab.y, ab.x);
    let endAngle = Math.atan2(ac.y, ac.x);

    let sweep = endAngle - startAngle;
    while (sweep <= -Math.PI) sweep += 2 * Math.PI;
    while (sweep > Math.PI) sweep -= 2 * Math.PI;

    if (sweep < 0) {
        const t = startAngle;
        startAngle = endAngle;
        endAngle = t;
        sweep = -sweep;
    }
    if (sweep < 1e-3) return "";

    const arcStart = {
        x: vertexA.x + radius * Math.cos(startAngle),
        y: vertexA.y + radius * Math.sin(startAngle),
    };
    const arcEnd = {
        x: vertexA.x + radius * Math.cos(endAngle),
        y: vertexA.y + radius * Math.sin(endAngle),
    };

    return `M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 0 1 ${arcEnd.x} ${arcEnd.y}`;
}

export function angleBisectorPoint(vertexA: Point, vertexB: Point, vertexC: Point, distance: number): Point {
    const dirAB = normalized(vectorBetween(vertexA, vertexB));
    const dirAC = normalized(vectorBetween(vertexA, vertexC));
    const bisector = normalized({ x: dirAB.x + dirAC.x, y: dirAB.y + dirAC.y });
    return { x: vertexA.x + bisector.x * distance, y: vertexA.y + bisector.y * distance };
}

export function buildDisplayQuery(a: Point, b: Point, c: Point): string {
    const enc = (p: Point) => `${p.x},${p.y}`;
    return `?a=${enc(a)}&b=${enc(b)}&c=${enc(c)}`;
}

export function parseDisplayQuery(search: string): { a?: Point; b?: Point; c?: Point } {
    const qs = new URLSearchParams(search);

    const parsePoint = (key: string): Point | undefined => {
        const raw = qs.get(key);
        if (!raw) return;
        const [xs, ys] = raw.split(",");
        const x = Number(xs);
        const y = Number(ys);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        return { x, y };
    };

    return { a: parsePoint("a"), b: parsePoint("b"), c: parsePoint("c") };
}

export function triangleArea(vertexA: Point, vertexB: Point, vertexC: Point): number {
    const twice = vertexA.x * (vertexB.y - vertexC.y)
        + vertexB.x * (vertexC.y - vertexA.y)
        + vertexC.x * (vertexA.y - vertexB.y);
    return Math.abs(twice) / 2;
}

export function isNonCollinear(vertexA: Point, vertexB: Point, vertexC: Point, epsilon = 1e-6): boolean {
    return triangleArea(vertexA, vertexB, vertexC) > epsilon;
}

export function centroidOf(vertexA: Point, vertexB: Point, vertexC: Point): Point {
    return {
        x: (vertexA.x + vertexB.x + vertexC.x) / 3,
        y: (vertexA.y + vertexB.y + vertexC.y) / 3,
    };
}

export const centroid = centroidOf;

export function isFinitePoint(p: Point): boolean {
    return Number.isFinite(p.x) && Number.isFinite(p.y);
}

export function randomTriangleInBox(width = 800, height = 800, margin = 60, minSide = 80, maxTries = 200): TriangleForm {
    function rnd(min: number, max: number) { return Math.random() * (max - min) + min; }
    function dist(p: Point, q: Point) { return Math.hypot(q.x - p.x, q.y - p.y); }

    for (let i = 0; i < maxTries; i++) {
        const a: Point = { x: rnd(margin, width - margin), y: rnd(margin, height - margin) };
        const b: Point = { x: rnd(margin, width - margin), y: rnd(margin, height - margin) };
        const c: Point = { x: rnd(margin, width - margin), y: rnd(margin, height - margin) };

        const okSides = dist(a, b) > minSide && dist(b, c) > minSide && dist(c, a) > minSide;
        if (okSides && isNonCollinear(a, b, c)) return { a, b, c };
    }
    return DEFAULT_POINTS;
}

export function distance(p: Point, q: Point) {
    return Math.hypot(q.x - p.x, q.y - p.y);
}

export function midpoint(p: Point, q: Point): Point {
    return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
}

export type SideKind = "Equilateral" | "Isosceles" | "Scalene";
export type AngleKind = "Right" | "Acute" | "Obtuse";

export function sideType(a: number, b: number, c: number, eps = 1e-6): SideKind {
    const eq = (x: number, y: number) => Math.abs(x - y) < eps;
    if (eq(a, b) && eq(b, c)) return "Equilateral";
    if (eq(a, b) || eq(b, c) || eq(c, a)) return "Isosceles";
    return "Scalene";
}

export function angleType(a: number, b: number, c: number, eps = 1e-6): AngleKind {
    const [S1, S2, L] = [a, b, c].sort((x, y) => x - y);
    const lhs = L * L;
    const rhs = S1 * S1 + S2 * S2;
    if (Math.abs(lhs - rhs) < eps) return "Right";
    return lhs < rhs ? "Acute" : "Obtuse";
}
