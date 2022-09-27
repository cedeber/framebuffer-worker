import type {
	LineArguments,
	CircleArguments,
	RectangleArguments,
	TextArguments,
	PolylineArguments,
	RoundedRectangleArguments,
	EllipseArguments,
	TriangleArguments,
	ArcArguments,
	SectorArguments,
	WorkerRequest,
	BoundingJs,
} from "./objects.js";
import init, { Bounding, Drawing } from "./wasm/canvas.js";
import { AppEvents } from "./objects.js";

// TODO pass `ctx` to Wasm in order to `self.postMessage({ event: "reload" })`?
const ctx = self as WorkerGlobalScope & typeof globalThis;

// We need to expose BoundingJs because the function are not easily serializable.
const done = (id: string, bounding: BoundingJs) => {
	ctx.postMessage({ event: AppEvents.Done, id, bounding });
};

(init as any)().then(() => {
	let drawing: Drawing;

	ctx.addEventListener(
		"message",
		({ data: { id, event, data } }: MessageEvent<WorkerRequest<any>>) => {
			// Setup
			if (event === AppEvents.Start) {
				// Receive the Shared Array Buffer from the main thread
				drawing = new Drawing(data.sab, data.width, data.height);
				// Allow to draw now :-D
				ctx.postMessage({ event: AppEvents.Go });
				return;
			}

			// Intersect
			let bounding!: BoundingJs;

			// Drawing
			if (event === AppEvents.Clear) {
				drawing.clear();
			} else if (event === AppEvents.Line) {
				const { startPoint, endPoint, style } = <LineArguments>data;
				drawing.line(startPoint, endPoint, style);
			} else if (event === AppEvents.Circle) {
				const { topLeftPoint, diameter, style } = <CircleArguments>data;
				bounding = drawing.circle(topLeftPoint, diameter, style)?.as_js();
			} else if (event === AppEvents.Rectangle) {
				const { topLeftPoint, size, style, radius } = <RectangleArguments>data;
				drawing.rectangle(topLeftPoint, size, style, radius);
			} else if (event === AppEvents.RoundedRectangle) {
				const { topLeftPoint, size, style, corners } = <RoundedRectangleArguments>data;
				drawing.rounded_rectangle(topLeftPoint, size, style, corners);
			} else if (event === AppEvents.Ellipse) {
				const { topLeftPoint, size, style } = <EllipseArguments>data;
				drawing.ellipse(topLeftPoint, size, style);
			} else if (event === AppEvents.Arc) {
				const { topLeftPoint, diameter, angleStart, angleSweep, style } = <ArcArguments>(
					data
				);
				drawing.arc(topLeftPoint, diameter, angleStart, angleSweep, style);
			} else if (event === AppEvents.Sector) {
				const { topLeftPoint, diameter, angleStart, angleSweep, style } = <SectorArguments>(
					data
				);
				drawing.sector(topLeftPoint, diameter, angleStart, angleSweep, style);
			} else if (event === AppEvents.Triangle) {
				const { vertex1, vertex2, vertex3, style } = <TriangleArguments>data;
				drawing.triangle(vertex1, vertex2, vertex3, style);
			} else if (event === AppEvents.Polyline) {
				const { points, style } = <PolylineArguments>data;
				drawing.polyline(points, style);
			} else if (event === AppEvents.Text) {
				const { position, label, size, textColor, textStyle } = <TextArguments>data;
				drawing.text(position, label, size, textColor, textStyle);
			}

			done(id, bounding);
		},
	);

	// Wasm is instantiated
	ctx.postMessage({ event: AppEvents.Ready });
});
