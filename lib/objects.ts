/** Reproduce the Style (Rust) struct */
class Style {
	constructor(
		public fillColor?: Color,
		public strokeColor?: Color,
		public strokeWidth?: number,
	) {}
}

/** Reproduce the Color (Rust) struct */
class Color {
	constructor(public red: number, public green: number, public blue: number) {}
}

/** Reproduce the Point (Rust) struct */
class Point {
	constructor(public x: number, public y: number) {}
}

/** Reproduce the Size (Rust) struct */
class Size {
	constructor(public width: number, public height: number) {}
}

export { Style, Color, Point, Size };
