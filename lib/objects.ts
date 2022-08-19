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
	Text = "text",

	/** A drawing is done */
	Done = "done",
}

export { AppEvents };
