import type { WorkerApi, DrawingApi, LineArguments, CircleArguments } from "./types.js";
import init, { Color, Drawing, Point } from "./wasm/canvas.js";
import type { Point as JsPoint, Color as JsColor } from "./objects.js";

// TODO pass `self` to Wasm in order to `self.postMessage({ event: "reload" })`?

const done = (id: string) => {
	self.postMessage({ id, event: "done" });
};

const toPoint = (point: JsPoint) => new Point(point.x, point.y);
const toColor = (color?: JsColor) =>
	color ? new Color(color.red, color.green, color.blue) : undefined;

(init as any)().then(() => {
	let drawing: Drawing;

	self.addEventListener("message", ({ data: { id, event, data } }: MessageEvent<WorkerApi<any>>) => {
		if (event === "start") {
			// Receive the Shared Array Buffer from the main thread
			drawing = new Drawing(data.sab, data.width, data.height);
			// Allow to draw now :-D
			self.postMessage({ event: "go" });
		} else if (event === "clear") {
			drawing.clear();
			done(id);
		} else if (event === "line") {
			const { startPoint, endPoint, strokeColor, strokeWidth } = <LineArguments>data;
			drawing.line(
				toPoint(startPoint),
				toPoint(endPoint),
				toColor(strokeColor)!,
				strokeWidth,
			);
			done(id);
		} else if (event === "circle") {
			const { topLeftPoint, diameter, fillColor, strokeColor, strokeWidth } = <
				CircleArguments
			>data;
			drawing.circle(
				toPoint(topLeftPoint),
				diameter,
				toColor(fillColor),
				toColor(strokeColor),
				strokeWidth,
			);
			done(id);
		}
	});

	// Wasm is instantiated
	self.postMessage({ event: "ready" });
});
