import type { WorkerApi } from "./types.js";
import init, { Color, Drawing } from "./wasm/canvas.js";

// TODO pass `self` to Wasm in order to `self.postMessage({ event: "reload" })`?

const done = (id: string) => {
	self.postMessage({ id, event: "done" });
};

(init as any)().then(() => {
	let drawing: Drawing;

	self.addEventListener("message", ({ data: { id, event, data } }: MessageEvent<WorkerApi>) => {
		if (event === "start") {
			// Receive the Shared Array Buffer from the main thread
			drawing = new Drawing(data.sab, data.width, data.height);
			// Allow to draw now :-D
			self.postMessage({ event: "go" });
		} else if (event === "clear") {
			drawing.clear();
			done(id);
		} else if (event === "line") {
			const { x1, y1, x2, y2, strokeColor, strokeWidth = 1 } = data;
			drawing.line(
				x1,
				y1,
				x2,
				y2,
				new Color(strokeColor?.red ?? 0, strokeColor?.green ?? 0, strokeColor?.blue ?? 0),
				strokeWidth,
			);
			done(id);
		} else if (event === "circle") {
			const { x, y, diameter, fillColor, strokeColor, strokeWidth } = data;
			drawing.circle(
				x,
				y,
				diameter,
				fillColor
					? new Color(fillColor?.red ?? 0, fillColor?.green ?? 0, fillColor?.blue ?? 0)
					: undefined,
				strokeColor
					? new Color(
							strokeColor?.red ?? 0,
							strokeColor?.green ?? 0,
							strokeColor?.blue ?? 0,
					  )
					: undefined,
				strokeWidth,
			);
			done(id);
		}
	});

	// Wasm is instantiated
	self.postMessage({ event: "ready" });
});
