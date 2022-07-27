import type { DrawingApi, WorkerApi } from "./types.js";
import { better_throttle as throttle } from "./utils.js";

const init = (canvas: HTMLCanvasElement): Promise<DrawingApi> => {
	return new Promise<DrawingApi>((resolve) => {
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

		// This is the API exposed from the module.
		// It will be send only once everything is ready.
		const api: DrawingApi = {
			reset() {
				worker.postMessage({ event: "reset", data: {} });
			},
			line(x1, y1, x2, y2) {
				worker.postMessage({ event: "line", data: { x1, y1, x2, y2 } });
			},
		};

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
					isWorking = true;
					worker.postMessage({
						event: eventName,
						data: {
							x: e.offsetX,
							y: e.offsetY,
							type: e.type,
						},
					});
				}
			}, 50);
			canvas.addEventListener(eventName, debCb);
		});

		worker.addEventListener("message", ({ data: { event } }: MessageEvent<WorkerApi>) => {
			if (event === "ready") {
				worker.postMessage({
					event: "start",
					data: { sab: sharedArrayBuffer, width: WIDTH, height: HEIGHT },
				});
			} else if (event === "go") {
				// Allow to draw now :-D
				isWorking = false;
				resolve(api);
			} else if (event === "reload") {
				requestAnimationFrame(() => {
					const frameBuffer = u8Array.slice(0);
					const imgData = new ImageData(frameBuffer, WIDTH, HEIGHT);
					// TODO Drag the picture left <-> right here
					ctx.putImageData(imgData, 0, 0);
					isWorking = false;
				});
			}
		});
	});
};

export { init };
