/**
 * DisplayPage.tsx
 * - Responsive SVG with viewBox.
 * - Angle arcs + labels (kept).
 * - Colored sides (longest=red, middle=blue, shortest=green) as separate lines.
 * - Side-length labels colored to match their sides.
 * - Perimeter/Area with MathJax (via MathBlock).
 * - Centroid (G).
 * - Units switch (px / units).
 * - Triangle type detection (side + angle) with Hebrew labels.
 * - Legend for side colors.
 */

import { useMemo, useState } from "react";
import { fitToBox } from "../utils/fitToBox";
import {
    angleArcPathAt,
    angleAtVertex,
    angleBisectorPoint,
    centroidOf,
    toDegrees,
    distance,
    midpoint,
    sideType,
    angleType,
    type Point,
} from "../utils/geometry";
import MathBlock from "./MathBlock";
import { TRIANGLE_TYPE_HE } from "../types/translations";

type Props = {
    vertexA: Point;
    vertexB: Point;
    vertexC: Point;
    onBack: () => void;
};

type UnitOption = { label: string; symbol: string; scale: number };
// scale converts px -> chosen units for display
const UNIT_OPTIONS: UnitOption[] = [
    { label: "Pixels", symbol: "px", scale: 1 },
    { label: "Units", symbol: "u", scale: 0.02 },
];

// side color roles
const roleColor = {
    longest: "#ef4444", // red
    middle: "#3b82f6", // blue
    shortest: "#22c55e", // green
} as const;

export default function DisplayPage({ vertexA, vertexB, vertexC, onBack }: Props) {
    // Fit into 800x800 logical space; SVG stays responsive via CSS viewBox
    const { mapped } = useMemo(
        () => fitToBox([vertexA, vertexB, vertexC]),
        [vertexA, vertexB, vertexC]
    );
    const [A, B, C] = mapped;

    // Units selector
    const [units, setUnits] = useState<UnitOption>(UNIT_OPTIONS[0]);
    const fmt = (v: number) => (v * units.scale).toFixed(2);
    const unitLabel = (v: number) => `${fmt(v)} ${units.symbol}`;

    // Side lengths (a = BC, b = CA, c = AB) in px
    const cLen = distance(A, B); // AB
    const aLen = distance(B, C); // BC
    const bLen = distance(C, A); // CA

    // Determine longest/middle/shortest
    const longest = Math.max(aLen, bLen, cLen);
    const shortest = Math.min(aLen, bLen, cLen);
    const lenToRole = (len: number) =>
        Math.abs(len - longest) < 1e-6 ? "longest" :
            Math.abs(len - shortest) < 1e-6 ? "shortest" : "middle";
    const roleAB = lenToRole(cLen); // AB corresponds to c
    const roleBC = lenToRole(aLen); // BC corresponds to a
    const roleCA = lenToRole(bLen); // CA corresponds to b

    // Midpoints for length labels
    const midAB = midpoint(A, B);
    const midBC = midpoint(B, C);
    const midCA = midpoint(C, A);

    // Arc radius scales with the triangle size
    const arcRadius = Math.max(14, Math.min(38, Math.min(aLen, bLen, cLen) * 0.18));
    const labelDistance = arcRadius + 18;

    // Angles + arcs + angle-label positions
    const vertices = [
        { vertex: A, neighbor1: B, neighbor2: C, label: "A" },
        { vertex: B, neighbor1: C, neighbor2: A, label: "B" },
        { vertex: C, neighbor1: A, neighbor2: B, label: "C" },
    ].map(({ vertex, neighbor1, neighbor2, label }) => {
        const angle = angleAtVertex(vertex, neighbor1, neighbor2);
        const arcPath = angleArcPathAt(vertex, neighbor1, neighbor2, arcRadius); // ⟵ keep angle “rays”
        const labelPos = angleBisectorPoint(vertex, neighbor1, neighbor2, labelDistance);
        return { vertex, label, angle, arcPath, labelPos };
    });

    // Centroid
    const G = centroidOf(A, B, C);

    // Perimeter & Area (Heron)
    const perimeter = aLen + bLen + cLen;
    const s = perimeter / 2;
    const area = Math.sqrt(Math.max(0, s * (s - aLen) * (s - bLen) * (s - cLen)));

    // Triangle types (English → Hebrew via TRIANGLE_TYPE_HE)
    const bySides = sideType(aLen, bLen, cLen);
    const byAngles = angleType(aLen, bLen, cLen);

    // LaTeX strings
    const texPerimeter = `p = a + b + c = ${fmt(aLen)} + ${fmt(bLen)} + ${fmt(cLen)}\\,${units.symbol} = ${fmt(perimeter)}\\,${units.symbol}`;
    const texArea = `s = \\frac{a+b+c}{2} = ${fmt(s)},\\quad A = \\sqrt{s(s-a)(s-b)(s-c)} = ${fmt(area)}\\,${units.symbol}^{2}`;
    const texCentroid = `G\\;=\\;\\left(\\frac{x_A + x_B + x_C}{3},\\;\\frac{y_A + y_B + y_C}{3}\\right)\\;=\\;(${G.x.toFixed(2)},\\;${G.y.toFixed(2)})`;

    return (
        <div className="page">
            <h1 className="title">Triangle - Display</h1>

            {/* Controls */}
            <div className="actions" style={{ justifyContent: "flex-start", gap: 12, marginBottom: 10 }}>
                <label className="field" style={{ gridTemplateColumns: "auto auto" }}>
                    <span style={{ marginRight: 8 }}>Units</span>
                    <select
                        value={units.label}
                        onChange={(e) => setUnits(UNIT_OPTIONS.find(u => u.label === e.target.value) || UNIT_OPTIONS[0])}
                        style={{ padding: "6px 10px", borderRadius: 8 }}
                    >
                        {UNIT_OPTIONS.map(u => <option key={u.label} value={u.label}>{u.label}</option>)}
                    </select>
                </label>

                {/* Type badges (Hebrew) */}
                <span className="badge">{TRIANGLE_TYPE_HE[bySides]}</span>
                <span className="badge">{TRIANGLE_TYPE_HE[byAngles]}</span>
            </div>

            <div className="canvas">
                <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid meet">
                    <rect x={0} y={0} width={800} height={800} fill="#f8fafc" />

                    {/* Fill-only polygon for interior */}
                    <polygon
                        points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
                        fill="#e8f1ff"
                        stroke="none"
                    />

                    {/* Colored sides as separate lines */}
                    <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={roleColor[roleAB]} strokeWidth={3} />
                    <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke={roleColor[roleBC]} strokeWidth={3} />
                    <line x1={C.x} y1={C.y} x2={A.x} y2={A.y} stroke={roleColor[roleCA]} strokeWidth={3} />

                    {/* Side-length labels (colored to match sides).
              Use inline style to avoid CSS .label fill overrides */}
                    <text
                        x={midAB.x}
                        y={midAB.y}
                        className="label"
                        textAnchor="middle"
                        dy={-6}
                        style={{ fill: roleColor[roleAB], fontWeight: 600 }}
                    >
                        {unitLabel(cLen)}
                    </text>
                    <text
                        x={midBC.x}
                        y={midBC.y}
                        className="label"
                        textAnchor="middle"
                        dy={-6}
                        style={{ fill: roleColor[roleBC], fontWeight: 600 }}
                    >
                        {unitLabel(aLen)}
                    </text>
                    <text
                        x={midCA.x}
                        y={midCA.y}
                        className="label"
                        textAnchor="middle"
                        dy={-6}
                        style={{ fill: roleColor[roleCA], fontWeight: 600 }}
                    >
                        {unitLabel(bLen)}
                    </text>

                    {/* Angle arcs + angle labels + vertex dots */}
                    {vertices.map(({ vertex, label, angle, arcPath, labelPos }, idx) => (
                        <g key={idx}>
                            {/* keep the arc “rays” */}
                            {arcPath && <path d={arcPath} stroke="#0ea5e9" strokeWidth={3} fill="none" />}
                            <circle cx={vertex.x} cy={vertex.y} r={5} fill="#1e3a8a" />
                            <text x={vertex.x + 8} y={vertex.y - 8} className="label small">{label}</text>
                            <text x={labelPos.x} y={labelPos.y} className="label">{toDegrees(angle).toFixed(1)}°</text>
                        </g>
                    ))}

                    {/* Centroid */}
                    <g>
                        <circle cx={G.x} cy={G.y} r={4} fill="#ef4444" />
                        <text x={G.x + 6} y={G.y - 6} className="label small">G</text>
                    </g>
                </svg>
            </div>

            {/* Legend */}
            <div style={{ marginTop: 8, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <LegendSwatch color={roleColor.longest} label="longest" />
                <LegendSwatch color={roleColor.middle} label="middle" />
                <LegendSwatch color={roleColor.shortest} label="shortest" />
            </div>

            {/* MathJax formulas */}
            <div style={{ marginTop: 12 }}>
                <MathBlock tex={texPerimeter} />
                <MathBlock tex={texArea} />
                <MathBlock tex={texCentroid} />
            </div>

            <div className="actions">
                <button className="btn" onClick={onBack}>Back</button>
            </div>
        </div>
    );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span
                style={{
                    width: 14,
                    height: 14,
                    background: color,
                    borderRadius: 4,
                    border: "1px solid rgba(0,0,0,0.1)",
                }}
            />
            <span style={{ fontSize: 12 }}>{label}</span>
        </span>
    );
}
