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

	/** A drawing is done */
	Done = "done",
}

/**
 * Reproduce the Style (Rust) struct.
 * Will be transferred as object, so Object notation is also possible
 */
class Style {
	constructor(
		public fillColor?: Color,
		public strokeColor?: Color,
		public strokeWidth?: number,
	) {}
}

/**
 * Reproduce the Color (Rust) struct.
 * Will be transferred as object, so Object notation is also possible
 */
class Color {
	constructor(public red: number, public green: number, public blue: number) {}
}

/**
 * Reproduce the Point (Rust) struct.
 * Will be transferred as object, so Object notation is also possible
 */
class Point {
	constructor(public x: number, public y: number) {}
}

/**
 * Reproduce the Size (Rust) struct.
 * Will be transferred as object, so Object notation is also possible
 */
class Size {
	constructor(public width: number, public height: number) {}
}

export { AppEvents, Style, Color, Point, Size };
