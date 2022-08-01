import { Color } from "./index.js";

interface WorkerApi {
	event: string;
	data?: any;
}

interface DrawingApi {
	/** Fill the whole framebuffer with `0x0` */
	clear(): Promise<void>;
	/** Render the framebuffer into the Canvas */
	render(): Promise<void>;
	/** Draw a line */
	line(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		strokeColor?: Color,
		strokeWidth?: number,
	): Promise<void>;
	circle(
		x: number,
		y: number,
		diameter: number,
		fillColor?: Color,
		strokeColor?: Color,
		strokeWidth?: number,
	): Promise<void>;
}

export type { WorkerApi, DrawingApi };
