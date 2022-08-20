import type { Point, Size, Style, Color, TextStyle } from "./wasm/canvas.js";

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

/** circle() function parameters */
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
	radius?: number;
}

/** polyline() function parameters */
interface PolylineArguments {
	points: Point[];
	style: Style;
}

/** text() function parameters */
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
	polyline(args: PolylineArguments): Promise<void>;
	text(args: TextArguments): Promise<void>;
}

const enum AppEvents {
	/** Wasm instantiated */
	Ready = "ready",
	/** Send the SharedArrayBuffer */
	Start = "start",
	/** Drawing (Rust) is created */
	Go = "go",

	/** Clean the screen */
	Clear = "clear",

	// Primitives
	Line = "line",
	Circle = "circle",
	Rectangle = "rectangle",
	Polyline = "polyline",
	Text = "text",

	/** A drawing is done */
	Done = "done",
}

export { AppEvents };
export type {
	WorkerApi,
	DrawingApi,
	LineArguments,
	CircleArguments,
	RectangleArguments,
	PolylineArguments,
	TextArguments,
};
