import type {
	WorkerApi,
	LineArguments,
	CircleArguments,
	RectangleArguments,
	TextArguments,
} from "./objects.js";
import init, { Drawing } from "./wasm/canvas.js";
import { AppEvents } from "./objects.js";

// TODO pass `ctx` to Wasm in order to `self.postMessage({ event: "reload" })`?
const ctx = self as WorkerGlobalScope & typeof globalThis;

const done = (id: string) => {
	ctx.postMessage({ id, event: AppEvents.Done });
};

(init as any)().then(() => {
	let drawing: Drawing;

	ctx.addEventListener(
		"message",
		({ data: { id, event, data } }: MessageEvent<WorkerApi<any>>) => {
			// Setup
			if (event === AppEvents.Start) {
				// Receive the Shared Array Buffer from the main thread
				drawing = new Drawing(data.sab, data.width, data.height);
				// Allow to draw now :-D
				ctx.postMessage({ event: AppEvents.Go });
				return;
			}

			// Drawing
			if (event === AppEvents.Clear) {
				drawing.clear();
			} else if (event === AppEvents.Line) {
				const { startPoint, endPoint, style } = <LineArguments>data;
				drawing.line(startPoint, endPoint, style);
			} else if (event === AppEvents.Circle) {
				const { topLeftPoint, diameter, style } = <CircleArguments>data;
				drawing.circle(topLeftPoint, diameter, style);
			} else if (event === AppEvents.Rectangle) {
				const { topLeftPoint, size, style, radius } = <RectangleArguments>data;
				drawing.rectangle(topLeftPoint, size, style, radius);
			} else if (event === AppEvents.Text) {
				const { position, label, size, textColor, textStyle } = <TextArguments>data;
				drawing.text(position, label, size, textColor, textStyle);
			}

			done(id);
		},
	);

	// Wasm is instantiated
	ctx.postMessage({ event: AppEvents.Ready });
});
