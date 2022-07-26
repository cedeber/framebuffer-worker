import type { WorkerApi } from "./types.js";
import init, { well } from "./wasm/canvas.js";

// TODO pass `self` to Wasm in order to `self.postMessage({ event: "reload" })`?

const draw: typeof well = (sab, w, h, x, y) => {
	const start = performance.now();
	well(sab, w, h, Math.floor(x), Math.floor(y));
	const end = performance.now();
	console.log("drawing", `${(end - start).toFixed(0)}ms`);
	self.postMessage({ event: "reload" });
};

(init as any)().then(() => {
	let sab: SharedArrayBuffer;
	let width: number;
	let height: number;

	self.addEventListener("message", ({ data: { event, data } }: MessageEvent<WorkerApi>) => {
		// console.log(event);
		if (event === "start") {
			sab = data.sab;
			width = data.width;
			height = data.height;

			// Allow to draw now :-D
			self.postMessage({ event: "go" });
		} else if (event === "pointermove") {
			draw(sab, width, height, data.x, data.y);
		} else if (event === "draw") {
			draw(sab, width, height, 0, 0);
		}
	});

	// Wasm is instantiated
	self.postMessage({ event: "ready" });
});
