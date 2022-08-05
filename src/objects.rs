use embedded_graphics::primitives::{PrimitiveStyle, PrimitiveStyleBuilder};
use embedded_graphics::{
	geometry::{Point as EgPoint, Size as EgSize},
	pixelcolor::Rgb888,
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Style {
	fill_color: Option<Color>,
	stroke_color: Option<Color>,
	stroke_width: Option<u32>,
}

#[wasm_bindgen]
impl Style {
	#[wasm_bindgen(constructor)]
	pub fn new(
		fill_color: Option<Color>,
		stroke_color: Option<Color>,
		stroke_width: Option<u32>,
	) -> Self {
		Style {
			fill_color,
			stroke_color,
			stroke_width,
		}
	}
}

impl From<Style> for PrimitiveStyle<Rgb888> {
	fn from(style: Style) -> Self {
		let mut _style: PrimitiveStyleBuilder<Rgb888> = PrimitiveStyleBuilder::new();

		if let Some(color) = style.fill_color {
			_style = _style.fill_color(color.into());
		}

		if let Some(color) = style.stroke_color {
			_style = _style.stroke_color(color.into());
		}

		if let Some(width) = style.stroke_width {
			_style = _style.stroke_width(width);
		}

		_style.build()
	}
}

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

#[wasm_bindgen]
pub struct Size {
	width: u32,
	height: u32,
}

#[wasm_bindgen]
impl Size {
	#[wasm_bindgen(constructor)]
	pub fn new(width: u32, height: u32) -> Self {
		Size { width, height }
	}
}

impl From<Size> for EgSize {
	fn from(size: Size) -> Self {
		EgSize::new(size.width, size.height)
	}
}
