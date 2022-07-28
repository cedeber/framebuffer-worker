import type { WorkerApi } from "./types.js";
import init, { Color, Drawing } from "./wasm/canvas.js";

// TODO pass `self` to Wasm in order to `self.postMessage({ event: "reload" })`?

const done = () => {
	self.postMessage({ event: "done" });
};

(init as any)().then(() => {
	let drawing: Drawing;

	self.addEventListener("message", ({ data: { event, data } }: MessageEvent<WorkerApi>) => {
		if (event === "start") {
			// Receive the Shared Array Buffer from the main thread
			drawing = new Drawing(data.sab, data.width, data.height);
			// Allow to draw now :-D
			self.postMessage({ event: "go" });
		} else if (event === "reset") {
			drawing.reset();
			done();
		} else if (event === "line") {
			const { x1, y1, x2, y2, color, width = 1 } = data;
			drawing.line(
				x1,
				y1,
				x2,
				y2,
				new Color(color?.red ?? 0, color?.green ?? 0, color?.blue ?? 0),
				width,
			);
			done();
		}
	});

	// Wasm is instantiated
	self.postMessage({ event: "ready" });
});
