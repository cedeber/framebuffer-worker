import type { CircleArguments, DrawingApi, LineArguments, WorkerApi } from "./types.js";
import { mergeImage, uid } from "./utils.js";

// Not sure if this is optimized!
const post = <T>(worker: Worker, event: string, data?: T) => {
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

const start = async (canvas: HTMLCanvasElement): Promise<() => Promise<DrawingApi>> => {
	// TODO: screen pixel density, aka Retina Display for instance (probably only integer)
	const ctx = canvas.getContext("2d")!;
	const WIDTH = canvas.width;
	const HEIGHT = canvas.height;

	const layers: Map<string, Uint8ClampedArray> = new Map();
	const layersOrder: string[] = [];

	const getApi = (worker: Worker, u8Array: Uint8ClampedArray): DrawingApi => {
		const id = uid();
		layersOrder.push(id);

		return {
			clear: () => post(worker, "clear"),
			line: (args) => post<LineArguments>(worker, "line", args),
			circle: (args) => post<CircleArguments>(worker, "circle", args),
			render: () => {
				return new Promise((resolve) => {
					requestAnimationFrame(() => {
						// Only copy the layer once ready
						layers.set(id, u8Array.slice(0));
						const layersArray: Uint8ClampedArray[] = [];

						for (const id of layersOrder) {
							const data = layers.get(id);
							if (data) layersArray.push(data);
						}

						const frameBuffer = mergeImage(layersArray);
						const imgData = new ImageData(frameBuffer, WIDTH, HEIGHT);
						// TODO Drag the picture left <-> right here
						ctx.putImageData(imgData, 0, 0);
						resolve();
					});
				});
			},
		};
	};

	const layer = () =>
		new Promise<DrawingApi>((resolve) => {
			const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
			const sharedArrayBuffer = new SharedArrayBuffer(WIDTH * HEIGHT * 4);
			const u8Array = new Uint8ClampedArray(sharedArrayBuffer);

			// This is the API exposed from the module.
			// It will be sent only once everything is ready.
			const api = getApi(worker, u8Array);

			worker.addEventListener(
				"message",
				({ data: { event } }: MessageEvent<WorkerApi<void>>) => {
					if (event === "ready") {
						worker.postMessage({
							event: "start",
							data: { sab: sharedArrayBuffer, width: WIDTH, height: HEIGHT },
						});
					} else if (event === "go") {
						// Allow to draw now :-D
						resolve(api);
					}
				},
			);
		});

	return layer;
};

export { start as init };
export { asyncThrottle } from "./utils.js";
export { Color, Point } from "./objects.js";
