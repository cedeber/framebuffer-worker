use embedded_graphics::{geometry::Point as EgPoint, pixelcolor::Rgb888};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Color {
	red: u8,
	green: u8,
	blue: u8,
	// alpha: u8,
}

#[wasm_bindgen]
impl Color {
	#[wasm_bindgen(constructor)]
	pub fn new(red: u8, green: u8, blue: u8) -> Self {
		Color { red, green, blue }
	}
}

impl From<Color> for Rgb888 {
	fn from(color: Color) -> Self {
		Rgb888::new(color.red, color.green, color.blue)
	}
}

#[wasm_bindgen]
pub struct Point {
	x: i32,
	y: i32,
}

#[wasm_bindgen]
impl Point {
	#[wasm_bindgen(constructor)]
	pub fn new(x: i32, y: i32) -> Self {
		Point { x, y }
	}
}

impl From<Point> for EgPoint {
	fn from(point: Point) -> Self {
		EgPoint::new(point.x, point.y)
	}
}
