import React, { useEffect, useMemo, useState } from "react";
import type { TriangleForm } from "../utils/geometry";
import { isFinitePoint, isNonCollinear, randomTriangleInBox } from "../utils/geometry";

type Props = {
    initial: TriangleForm;
    onSubmit: (form: TriangleForm) => void;
    onLoadHistory?: (item: TriangleForm) => void;
};

export default function InputPage({ initial, onSubmit, onLoadHistory }: Props) {
    const [form, setForm] = useState<TriangleForm>(initial);

    useEffect(() => {
        setForm(initial);
    }, [initial]);

    const update =
        (pointKey: keyof TriangleForm, axis: "x" | "y") =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((prev) => ({
                    ...prev,
                    [pointKey]: { ...prev[pointKey], [axis]: Number(e.target.value) },
                }));
            };

    const makeRandom = () => setForm(randomTriangleInBox());

    const fieldsValid = useMemo(
        () =>
            isFinitePoint(form.a) &&
            isFinitePoint(form.b) &&
            isFinitePoint(form.c),
        [form]
    );

    const nonCollinear = useMemo(
        () => isNonCollinear(form.a, form.b, form.c),
        [form]
    );

    const canSubmit = fieldsValid && nonCollinear;

    const history: TriangleForm[] = useMemo(() => {
        const raw = localStorage.getItem("triangle:history");
        return raw ? JSON.parse(raw) : [];
    }, [initial]);

    return (
        <div className="page">
            <h1 className="title">Triangle - Input</h1>
            <p className="muted">Enter three points (X, Y). Inputs must be numbers; points must not be collinear.</p>

            {!fieldsValid && <div className="alert">All coordinates must be valid numbers.</div>}
            {fieldsValid && !nonCollinear && <div className="alert">The three points lie on a straight line. Please adjust.</div>}

            <div className="grid">
                {(["a", "b", "c"] as const).map((key) => (
                    <fieldset className="card" key={key}>
                        <legend>Vertex {key.toUpperCase()}</legend>
                        <label className="field">
                            <span>X</span>
                            <input type="number" value={form[key].x} onChange={update(key, "x")} />
                        </label>
                        <label className="field">
                            <span>Y</span>
                            <input type="number" value={form[key].y} onChange={update(key, "y")} />
                        </label>
                    </fieldset>
                ))}
            </div>

            <div className="actions">
                <button className="btn" type="button" onClick={makeRandom}>Random Triangle</button>
                <button className="btn primary" type="button" onClick={() => onSubmit(form)} disabled={!canSubmit}>
                    Show Triangle
                </button>
            </div>

            {history.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <h3 style={{ margin: "8px 0" }}>Recent triangles</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
                        {history.map((item, idx) => (
                            <li key={idx} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <code style={{ fontSize: 12 }}>
                                    A({item.a.x},{item.a.y}) B({item.b.x},{item.b.y}) C({item.c.x},{item.c.y})
                                </code>
                                {onLoadHistory && (
                                    <button className="btn" onClick={() => onLoadHistory(item)}>Load</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
