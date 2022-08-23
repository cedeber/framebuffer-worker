import type { Point, Size, Style, Color, TextStyle, Corners, Angle } from "./wasm/canvas.js";

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

/** rounded_rectangle() function parameters */
interface RoundedRectangleArguments {
	topLeftPoint: Point;
	size: Size;
	style: Style;
	corners: Corners;
}

/** ellipse() function parameters */
interface EllipseArguments {
	topLeftPoint: Point;
	size: Size;
	style: Style;
}

/** arc() function parameters */
interface ArcArguments {
	topLeftPoint: Point;
	diameter: number;
	angleStart: Angle;
	angleSweep: Angle;
	style: Style;
}

/** sector() function parameters */
interface SectorArguments {
	topLeftPoint: Point;
	diameter: number;
	angleStart: Angle;
	angleSweep: Angle;
	style: Style;
}

/** triangle() function parameters */
interface TriangleArguments {
	vertex1: Point;
	vertex2: Point;
	vertex3: Point;
	style: Style;
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
	rounded_rectangle(args: RoundedRectangleArguments): Promise<void>;
	ellipse(args: EllipseArguments): Promise<void>;
	arc(args: ArcArguments): Promise<void>;
	sector(args: SectorArguments): Promise<void>;
	triangle(args: TriangleArguments): Promise<void>;
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
	RoundedRectangle = "rounded_rectangle",
	Ellipse = "ellipse",
	Arc = "arc",
	Sector = "sector",
	Triangle = "triangle",
	Polyline = "polyline",
	Text = "text",

	/** A drawing is done */
	Done = "done",
}

export { AppEvents };
export type {
	ArcArguments,
	CircleArguments,
	DrawingApi,
	EllipseArguments,
	LineArguments,
	PolylineArguments,
	RectangleArguments,
	RoundedRectangleArguments,
	SectorArguments,
	TextArguments,
	TriangleArguments,
	WorkerApi,
};
