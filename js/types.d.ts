import { Color } from "./index.js";

interface WorkerApi {
	event: string;
	data?: any;
}

interface DrawingApi {
	reset(): Promise<void>;
	paint(): Promise<void>;
	line(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		color?: Color,
		width?: number,
	): Promise<void>;
}

export type { WorkerApi, DrawingApi };
