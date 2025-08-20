/**
	* App.tsx
	*
	* Entry point for the React application.
	* - Uses react-router-dom for navigation between pages.
	* - "/" route -> InputPage: user enters three triangle vertices.
	* - "/display" route -> DisplayPage: renders the triangle and its angles.
*/


import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import DisplayPage from "./components/DisplayPage";
import InputPage from "./components/InputPage";
import {
	DEFAULT_POINTS,
	buildDisplayQuery,
	parseDisplayQuery,
	type TriangleForm,
} from "./utils/geometry";


import "./assets/styles/styles.css";

export default function App() {
	const navigate = useNavigate();
	const location = useLocation();

	const [initialForm, setInitialForm] = useState<TriangleForm>(() => {
		const saved = localStorage.getItem("triangle:last");
		if (saved) try { return JSON.parse(saved) as TriangleForm; } catch { }
		return DEFAULT_POINTS;
	});

	const queryPoints = parseDisplayQuery(location.search);

	const vertexA = queryPoints.a ?? initialForm.a;
	const vertexB = queryPoints.b ?? initialForm.b;
	const vertexC = queryPoints.c ?? initialForm.c;

	useEffect(() => {
		if (queryPoints.a && queryPoints.b && queryPoints.c) {
			setInitialForm({ a: queryPoints.a, b: queryPoints.b, c: queryPoints.c });
		}
	}, [location.search]);


	const goToDisplay = (next: TriangleForm) => {
		localStorage.setItem("triangle:last", JSON.stringify(next));

		const raw = localStorage.getItem("triangle:history");
		const list: TriangleForm[] = raw ? JSON.parse(raw) : [];
		const nextKey = JSON.stringify(next);
		const dedup = [next, ...list.filter(item => JSON.stringify(item) !== nextKey)].slice(0, 5);
		localStorage.setItem("triangle:history", JSON.stringify(dedup));

		navigate(`/display${buildDisplayQuery(next.a, next.b, next.c)}`);
	};

	const loadFromHistory = (item: TriangleForm) => {
		setInitialForm(item);
		navigate(`/`);
	};

	const goHome = () => navigate("/");

	return (
		<Routes>
			<Route
				path="/"
				element={<InputPage initial={initialForm} onSubmit={goToDisplay} onLoadHistory={loadFromHistory} />}
			/>
			<Route
				path="/display"
				element={<DisplayPage vertexA={vertexA} vertexB={vertexB} vertexC={vertexC} onBack={goHome} />}
			/>
		</Routes>
	);
}
