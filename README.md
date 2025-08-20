# Triangle Visualizer

This is a small React + TypeScript project that allows the user to input three points of a triangle and then view the triangle along with its internal angles.

- InputPage: lets the user enter three vertices (X and Y for each point).
- DisplayPage: shows the triangle inside an 800x800 SVG canvas.
  - Draws the triangle outline.
  - Shows arcs at each angle.
  - Displays angle values inside the triangle.
- The app uses react-router-dom for navigation between the input page (/) and the display page (/display).
- Geometry and scaling logic are in simple utility functions.

To run:
1. Install dependencies with `npm install`.
2. Start the dev server with `npm run dev`.
