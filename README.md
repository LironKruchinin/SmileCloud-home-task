# Triangle Geometry Visualizer

This project is a small interactive web app built with **Next.js + TypeScript**.  
It allows users to input or generate random triangle points and then displays key triangle properties in an interactive SVG visualization.

## Features
- Input coordinates manually or generate a **random triangle**.
- Validates input to ensure points are valid and non-collinear.
- Calculates and displays:
  - Side lengths
  - Angles (with arcs drawn in SVG)
  - Triangle **area** and **centroid**
  - Triangle **type** (Equilateral, Isosceles, Scalene, Right, Acute, Obtuse)
- Highlights **longest / middle / shortest** sides with color coding.
- Includes **unit switching** (px/cm) and a **history of triangles**.

## Tech Stack
- **React** (frontend + routing)
- **TypeScript** (type safety)
- **CSS** (styling)
- **Math utilities** in `geometry.ts` (angles, centroid, random triangle, etc.)

## Getting Started
```bash
git clone <repo-url>
cd <repo>
npm install
npm run dev
```


Use of ChatGPT in This Project

Besides code assistance, I also used ChatGPT as a debugging and documentation partner:

Debugging Queries – I pasted failing SQL and TypeScript snippets and asked for step-by-step reasoning of why they weren’t returning results. Instead of rewriting the code, ChatGPT helped me reason through joins, null checks, and edge cases by suggesting what to log and how to trace variables.

Logging Strategy – I asked for lightweight, practical logging ideas (e.g., console/debug statements and structured logs for runtime checks) to quickly trace where values got lost without cluttering the code.

Documentation Support – I used ChatGPT to draft and refine documentation like the project README and inline comments. This helped me keep the explanations short, recruiter-friendly, and easy to maintain.