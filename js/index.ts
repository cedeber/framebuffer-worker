import type { WorkerApi } from "./types.js";
import { throttle } from "./utils.js";

const init = (canvas: HTMLCanvasElement) => {
	// TODO, return worker?, eventList?
	return new Promise<void>((resolve) => {
		// Canvas and SharedArrayBuffer setup
		// TODO: screen pixel density, aka Retina Display for instance (probably only integer)
		const ctx = canvas.getContext("2d")!;

		const WIDTH = canvas.width;
		const HEIGHT = canvas.height;

		let sharedArrayBuffer = new SharedArrayBuffer(WIDTH * HEIGHT * 4);
		var u8Array = new Uint8ClampedArray(sharedArrayBuffer);

		// Instantiate the Worker
		const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });

		// No need to draw if something is already running
		// Set to `true` by default because we need to wait for Wasm.
		let isWorking = true;

		[
			// "mouseenter",
			// "mousedown",
			// "mousemove",
			// "mouseup",
			// "mousedown",
			"wheel",
			"contextmenu",
			"pointerdown",
			"pointermove",
			"pointerup",
			"pointercancel",
			"lostpointercapture",
		].forEach((eventName) => {
			const debCb = throttle((e) => {
				//! We may miss the last frame on move here
				if (!isWorking && eventName === "pointermove") {
					worker.postMessage({
						event: eventName,
						data: {
							x: e.offsetX,
							y: e.offsetY,
							type: e.type,
						},
					});
					isWorking = true;
				}
			}, 16);
			canvas.addEventListener(eventName, debCb);
		});

		worker.addEventListener("message", ({ data: { event, data } }: MessageEvent<WorkerApi>) => {
			if (event === "ready") {
				worker.postMessage({
					event: "start",
					data: { sab: sharedArrayBuffer, width: WIDTH, height: HEIGHT },
				});
			} else if (event === "go") {
				// Allow to draw now :-D
				isWorking = false;
				resolve();

				// TODO Shouldn't draw here
				worker.postMessage({ event: "draw" });
			} else if (event === "reload") {
				isWorking = false;
				requestAnimationFrame(() => {
					const frameBuffer = u8Array.slice(0);
					const start = performance.now();
					const imgData = new ImageData(frameBuffer, WIDTH, HEIGHT);
					ctx.putImageData(imgData, 0, 0);
					const end = performance.now();
					console.log("render", `${(end - start).toFixed(0)}ms`);
				});
			}
		});
	});
};

export { init };
