import type {
	WorkerApi,
	LineArguments,
	CircleArguments,
	RectangleArguments,
	TextArguments,
} from "./types.js";
import init, { Color, Drawing, Point, Size, Style } from "./wasm/canvas.js";
import type {
	Point as JsPoint,
	Color as JsColor,
	Style as JsStyle,
	Size as JsSize,
} from "./objects.js";
import { AppEvents } from "./objects.js";

// TODO pass `self` to Wasm in order to `self.postMessage({ event: "reload" })`?

const done = (id: string) => {
	self.postMessage({ id, event: AppEvents.Done });
};

const toPoint = (point: JsPoint) => new Point(point.x, point.y);
const toColor = (color?: JsColor) =>
	color ? new Color(color.red, color.green, color.blue) : undefined;
const toSize = (size: JsSize) => new Size(size.width, size.height);
const toStyle = (style: JsStyle) =>
	new Style(toColor(style.fillColor), toColor(style.strokeColor), style.strokeWidth);

(init as any)().then(() => {
	let drawing: Drawing;

	self.addEventListener(
		"message",
		({ data: { id, event, data } }: MessageEvent<WorkerApi<any>>) => {
			if (event === AppEvents.Start) {
				// Receive the Shared Array Buffer from the main thread
				drawing = new Drawing(data.sab, data.width, data.height);
				// Allow to draw now :-D
				self.postMessage({ event: AppEvents.Go });
			} else if (event === AppEvents.Clear) {
				drawing.clear();
				done(id);
			} else if (event === AppEvents.Line) {
				const { startPoint, endPoint, style } = <LineArguments>data;
				drawing.line(toPoint(startPoint), toPoint(endPoint), toStyle(style));
				done(id);
			} else if (event === AppEvents.Circle) {
				const { topLeftPoint, diameter, style } = <CircleArguments>data;
				drawing.circle(toPoint(topLeftPoint), diameter, toStyle(style));
				done(id);
			} else if (event === AppEvents.Rectangle) {
				const { topLeftPoint, size, style } = <RectangleArguments>data;
				drawing.rectangle(toPoint(topLeftPoint), toSize(size), toStyle(style));
				done(id);
			} else if (event === AppEvents.Text) {
				const { position: topLeftPoint, label, size, textColor } = <TextArguments>data;
				drawing.text(toPoint(topLeftPoint), label, size, toColor(textColor)!);
				done(id);
			}
		},
	);

	// Wasm is instantiated
	self.postMessage({ event: AppEvents.Ready });
});
