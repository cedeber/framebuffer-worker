import type {
	CircleArguments,
	DrawingApi,
	LineArguments,
	PolylineArguments,
	RectangleArguments,
	TextArguments,
	WorkerApi,
} from "./objects.js";
import { mergeImage, uid } from "./utils.js";
import { AppEvents } from "./objects.js";
import init from "./wasm/canvas.js";

/**
 * On the Rust size, we have implemented as_js() to export it as JS abject thanks to `serde`.
 */
function serializableData(data: any): any {
	if (typeof data.as_js === "function") {
		return data.as_js();
	} else if (typeof data === "number" || typeof data === "string") {
		return data;
	} else if (Array.isArray(data)) {
		return data.map(serializableData);
	}
}

// Not sure if this is optimized!
const post = <T>(worker: Worker, event: AppEvents, data?: T): Promise<void> => {
	const id = uid();
	return new Promise<void>((resolve) => {
		const cb = ({ data }: MessageEvent<WorkerApi<T>>) => {
			if (data.event === AppEvents.Done && data.id === id) {
				resolve();
				worker.removeEventListener("message", cb);
			}
		};
		worker.addEventListener("message", cb);

		// FIXME TypeScript drives me nuts with shitty types
		let dd: any = {} as T;
		for (const key in data) {
			dd[key] = serializableData(data[key]);
		}

		const message: WorkerApi<T> = { id, event, data: dd };
		worker.postMessage(message);
	});
};

const start = async (canvas: HTMLCanvasElement): Promise<() => Promise<DrawingApi>> => {
	await init();

	// TODO: screen pixel density, aka Retina Display for instance (probably only integer)
	const ctx = canvas.getContext("2d")!;
	const WIDTH = canvas.width;
	const HEIGHT = canvas.height;

	// TODO We should avoid keeping a copy of the layer buffer as long as we only have one
	const layers: Map<string, Uint8ClampedArray> = new Map();
	const layersOrder: string[] = [];

	const getApi = (worker: Worker, u8Array: Uint8ClampedArray): DrawingApi => {
		const id = uid();
		layersOrder.push(id);

		return {
			clear: () => post(worker, AppEvents.Clear),
			line: (args) => post<LineArguments>(worker, AppEvents.Line, args),
			circle: (args) => post<CircleArguments>(worker, AppEvents.Circle, args),
			rectangle: (args) => post<RectangleArguments>(worker, AppEvents.Rectangle, args),
			polyline: (args) => post<PolylineArguments>(worker, AppEvents.Polyline, args),
			text: (args) => post<TextArguments>(worker, AppEvents.Text, args),
			render: () => {
				// This MUST be very fast
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
					if (event === AppEvents.Ready) {
						worker.postMessage({
							event: AppEvents.Start,
							data: { sab: sharedArrayBuffer, width: WIDTH, height: HEIGHT },
						});
					} else if (event === AppEvents.Go) {
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
export { Point, Color, Size, Style, TextStyle, Alignment, Baseline } from "./wasm/canvas.js";
