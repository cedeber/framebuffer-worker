import type { WorkerApi } from "./types.js";
import init, { Drawing } from "./wasm/canvas.js";

// TODO pass `self` to Wasm in order to `self.postMessage({ event: "reload" })`?

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
		} else if (event === "line") {
			const { x1, y1, x2, y2 } = data;
			drawing.line(x1, y1, x2, y2);
			self.postMessage({ event: "reload" });
		}
	});

	// Wasm is instantiated
	self.postMessage({ event: "ready" });
});
