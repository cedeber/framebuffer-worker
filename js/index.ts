import type { DrawingApi, WorkerApi } from "./types.js";
import { better_throttle as throttle } from "./utils.js";

// Reproduce the Color (Rust) struct
class Color {
	red: number;
	green: number;
	blue: number;

	constructor(red: number, green: number, blue: number) {
		this.red = red;
		this.green = green;
		this.blue = blue;
	}
}

// Instantiate the Worker
const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });

// Not sure if this is optimized!
const post = (event: string, data: any = {}) => {
	return new Promise<void>((resolve) => {
		const cb = ({ data }) => {
			if (data.event === "done") {
				resolve();
				worker.removeEventListener("message", cb);
			}
		};
		worker.addEventListener("message", cb);
		worker.postMessage({ event, data });
	});
};

const init = (canvas: HTMLCanvasElement): Promise<DrawingApi> => {
	return new Promise<DrawingApi>((resolve) => {
		// Canvas and SharedArrayBuffer setup
		// TODO: screen pixel density, aka Retina Display for instance (probably only integer)
		const ctx = canvas.getContext("2d")!;

		const WIDTH = canvas.width;
		const HEIGHT = canvas.height;

		const sharedArrayBuffer = new SharedArrayBuffer(WIDTH * HEIGHT * 4);
		const u8Array = new Uint8ClampedArray(sharedArrayBuffer);

		// This is the API exposed from the module.
		// It will be sent only once everything is ready.
		const api: DrawingApi = {
			reset: () => post("reset"),
			line: (x1, y1, x2, y2, color, width) => post("line", { x1, y1, x2, y2, color, width }),
			paint: () => {
				return new Promise((resolve) => {
					requestAnimationFrame(() => {
						const frameBuffer = u8Array.slice(0);
						const imgData = new ImageData(frameBuffer, WIDTH, HEIGHT);
						// TODO Drag the picture left <-> right here
						ctx.putImageData(imgData, 0, 0);
						resolve();
					});
				});
			},
		};

		worker.addEventListener("message", ({ data: { event } }: MessageEvent<WorkerApi>) => {
			if (event === "ready") {
				worker.postMessage({
					event: "start",
					data: { sab: sharedArrayBuffer, width: WIDTH, height: HEIGHT },
				});
			} else if (event === "go") {
				// Allow to draw now :-D
				resolve(api);
			}
		});
	});
};

export { init, Color };
export { better_throttle as throttle } from "./utils.js";
