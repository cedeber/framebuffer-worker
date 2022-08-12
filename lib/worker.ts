import type {
	WorkerApi,
	LineArguments,
	CircleArguments,
	RectangleArguments,
	TextArguments,
} from "./types.js";
import init, { Color, Drawing, Point, Size, Style, TextStyle } from "./wasm/canvas.js";
import type {
	Point as JsPoint,
	Color as JsColor,
	Style as JsStyle,
	Size as JsSize,
	TextStyle as JsTextStyle,
} from "./objects.js";
import { AppEvents } from "./objects.js";

// TODO pass `ctx` to Wasm in order to `self.postMessage({ event: "reload" })`?
const ctx = self as WorkerGlobalScope & typeof globalThis;

const done = (id: string) => {
	ctx.postMessage({ id, event: AppEvents.Done });
};

const toPoint = (point: JsPoint) => new Point(point.x, point.y);
const toColor = (color?: JsColor) =>
	color ? new Color(color.red, color.green, color.blue, color.alpha ?? 0xff) : undefined;
const toSize = (size: JsSize) => new Size(size.width, size.height);
const toStyle = (style: JsStyle) =>
	new Style(toColor(style.fillColor), toColor(style.strokeColor), style.strokeWidth);
const toTextStyle = (style?: JsTextStyle) =>
	style ? new TextStyle(style.alignment, style.baseline) : undefined;

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
				drawing.line(toPoint(startPoint), toPoint(endPoint), toStyle(style));
			} else if (event === AppEvents.Circle) {
				const { topLeftPoint, diameter, style } = <CircleArguments>data;
				drawing.circle(toPoint(topLeftPoint), diameter, toStyle(style));
			} else if (event === AppEvents.Rectangle) {
				const { topLeftPoint, size, style } = <RectangleArguments>data;
				drawing.rectangle(toPoint(topLeftPoint), toSize(size), toStyle(style));
			} else if (event === AppEvents.Text) {
				const {
					position: topLeftPoint,
					label,
					size,
					textColor,
					textStyle,
				} = <TextArguments>data;
				drawing.text(
					toPoint(topLeftPoint),
					label,
					size,
					toColor(textColor)!,
					toTextStyle(textStyle),
				);
			}

			done(id);
		},
	);

	// Wasm is instantiated
	ctx.postMessage({ event: AppEvents.Ready });
});
