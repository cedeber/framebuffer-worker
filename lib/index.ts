import type {CircleArguments, DrawingApi, LineArguments, WorkerApi} from "./types.js";
import { uid } from "./utils.js";

// Instantiate the Worker
const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });

// Not sure if this is optimized!
const post = <T>(event: string, data?: T) => {
	const id = uid();
	return new Promise<void>((resolve) => {
		const cb = ({ data }: MessageEvent<WorkerApi<T>>) => {
			if (data.event === "done" && data.id === id) {
				resolve();
				worker.removeEventListener("message", cb);
			}
		};
		worker.addEventListener("message", cb);
		worker.postMessage({ id, event, data });
	});
};

const start = (canvas: HTMLCanvasElement): Promise<DrawingApi> => {
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
			clear: () => post("clear"),
			line: (args) => post<LineArguments>("line", args),
			circle: (args) => post<CircleArguments>("circle", args),
			render: () => {
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

		worker.addEventListener("message", ({ data: { event } }: MessageEvent<WorkerApi<void>>) => {
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

export { start as init };
export { asyncThrottle } from "./utils.js";
export { Color, Point } from "./objects.js";
