import type {
	Point,
	Size,
	Style,
	Color,
	TextStyle,
	Corners,
	Angle,
	Rectangle,
} from "./wasm/canvas.js";

/** Basic data to allow recognition of the event with the Worker */
interface WorkerCommunication {
	id: string;
	event: AppEvents;
}

interface WorkerRequest<T> extends WorkerCommunication {
	data?: T;
}

interface WorkerResponse extends WorkerCommunication {
	bounding?: Rectangle;
}

interface Shape {
	style: Style;
}

/** line() function parameters */
interface LineArguments extends Shape {
	startPoint: Point;
	endPoint: Point;
}

/** circle() function parameters */
interface CircleArguments extends Shape {
	topLeftPoint: Point;
	diameter: number;
}

/** rectangle() function parameters */
interface RectangleArguments extends Shape {
	topLeftPoint: Point;
	size: Size;
	radius?: number;
}

/** rounded_rectangle() function parameters */
interface RoundedRectangleArguments extends Shape {
	topLeftPoint: Point;
	size: Size;
	corners: Corners;
}

/** ellipse() function parameters */
interface EllipseArguments extends Shape {
	topLeftPoint: Point;
	size: Size;
}

/** arc() function parameters */
interface ArcArguments extends Shape {
	topLeftPoint: Point;
	diameter: number;
	angleStart: Angle;
	angleSweep: Angle;
}

/** sector() function parameters */
interface SectorArguments extends Shape {
	topLeftPoint: Point;
	diameter: number;
	angleStart: Angle;
	angleSweep: Angle;
}

/** triangle() function parameters */
interface TriangleArguments extends Shape {
	vertex1: Point;
	vertex2: Point;
	vertex3: Point;
}

/** polyline() function parameters */
interface PolylineArguments extends Shape {
	points: Point[];
}

/** text() function parameters */
interface TextArguments {
	position: Point;
	label: string;
	size: 7 | 9 | 10 | 12 | 14 | 18 | 24;
	textColor: Color;
	textStyle?: TextStyle;
}

/** aka. Rectangle */
export type Bounding = {
	top_left: { x: number; y: number };
	size: { width: number; height: number };
};

/** => Has to fake the Rust API */
interface DrawingApi {
	/** Fill the whole framebuffer with `0x0` */
	clear(): Promise<void>;
	/** Render the framebuffer into the Canvas */
	render(): Promise<void>;
	line(args: LineArguments): Promise<Rectangle | null>;
	circle(args: CircleArguments): Promise<Rectangle | null>;
	rectangle(args: RectangleArguments): Promise<Rectangle | null>;
	rounded_rectangle(args: RoundedRectangleArguments): Promise<Rectangle | null>;
	ellipse(args: EllipseArguments): Promise<Rectangle | null>;
	arc(args: ArcArguments): Promise<Rectangle | null>;
	sector(args: SectorArguments): Promise<Rectangle | null>;
	triangle(args: TriangleArguments): Promise<Rectangle | null>;
	polyline(args: PolylineArguments): Promise<Rectangle | null>;
	text(args: TextArguments): Promise<Rectangle | null>;
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
	WorkerRequest,
	WorkerResponse,
};
