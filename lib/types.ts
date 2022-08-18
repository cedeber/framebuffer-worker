import type { Color, Point } from "./index.js";
import type { AppEvents, Size, Style, TextStyle } from "./objects.js";

interface WorkerApi<T> {
	id: string;
	event: AppEvents;
	data?: T;
}

/** line() function parameters */
interface LineArguments {
	startPoint: Point;
	endPoint: Point;
	style: Style;
}

/** line() function parameters */
interface CircleArguments {
	topLeftPoint: Point;
	diameter: number;
	style: Style;
}

/** rectangle() function parameters */
interface RectangleArguments {
	topLeftPoint: Point;
	size: Size;
	style: Style;
}

interface TextArguments {
	position: Point;
	label: string;
	size: 7 | 9 | 10 | 12 | 14 | 18 | 24;
	textColor: Color;
	textStyle?: TextStyle;
}

/** => Has to fake the Rust API */
interface DrawingApi {
	/** Fill the whole framebuffer with `0x0` */
	clear(): Promise<void>;
	/** Render the framebuffer into the Canvas */
	render(): Promise<void>;
	line(args: LineArguments): Promise<void>;
	circle(args: CircleArguments): Promise<void>;
	rectangle(args: RectangleArguments): Promise<void>;
	text(args: TextArguments): Promise<void>;
}

export type {
	WorkerApi,
	DrawingApi,
	LineArguments,
	CircleArguments,
	RectangleArguments,
	TextArguments,
};
