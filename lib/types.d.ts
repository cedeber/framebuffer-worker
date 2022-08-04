import { Color, Point } from "./index.js";

interface WorkerApi<T> {
	id: string;
	event: string;
	data?: T;
}

/** line() function parameters */
interface LineArguments {
	startPoint: Point;
	endPoint: Point;
	strokeColor: Color;
	strokeWidth: number;
}

/** line() function parameters */
interface CircleArguments {
	topLeftPoint: Point;
	diameter: number;
	fillColor?: Color;
	strokeColor?: Color;
	strokeWidth?: number;
}

/** => Has to fake the Rust API */
interface DrawingApi {
	/** Fill the whole framebuffer with `0x0` */
	clear(): Promise<void>;
	/** Render the framebuffer into the Canvas */
	render(): Promise<void>;
	line(args: LineArguments): Promise<void>;
	circle(args: CircleArguments): Promise<void>;
}

export type { WorkerApi, DrawingApi, LineArguments, CircleArguments };
