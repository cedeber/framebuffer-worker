interface WorkerApi {
	event: string;
	data?: any;
}

interface DrawingApi {
	reset(): void;
	line(x1: number, y1: number, x2: number, y2: number, color?: Color, width?: number): void;
}

export type { WorkerApi, DrawingApi };
