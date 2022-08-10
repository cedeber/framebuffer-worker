use embedded_graphics::{
	geometry::{Point as EgPoint, Size as EgSize},
	pixelcolor::Rgb888,
	primitives::{PrimitiveStyle, PrimitiveStyleBuilder},
	text::{Alignment, Baseline, TextStyle as EgTextStyle, TextStyleBuilder},
};
use wasm_bindgen::prelude::*;

#[derive(Copy, Clone)]
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

#[derive(Copy, Clone)]
#[wasm_bindgen]
pub struct TextStyle {
	alignment: Option<Alignment>,
	baseline: Option<Baseline>,
}

#[wasm_bindgen]
impl TextStyle {
	#[wasm_bindgen(constructor)]
	pub fn new(alignment: Option<String>, baseline: Option<String>) -> Self {
		// Alignment::Left is default
		let align = match alignment {
			Some(value) => match value.as_str() {
				"center" => Some(Alignment::Center),
				"right" => Some(Alignment::Right),
				_ => Some(Alignment::Left),
			},
			_ => None,
		};

		// Baseline::Alphabetic is default
		let base = match baseline {
			Some(value) => match value.as_str() {
				"top" => Some(Baseline::Top),
				"bottom" => Some(Baseline::Bottom),
				"middle" => Some(Baseline::Middle),
				_ => Some(Baseline::Alphabetic),
			},
			_ => None,
		};

		TextStyle {
			alignment: align,
			baseline: base,
		}
	}
}

impl From<TextStyle> for EgTextStyle {
	fn from(style: TextStyle) -> Self {
		let mut _style = TextStyleBuilder::new();

		if let Some(baseline) = style.baseline {
			_style = _style.baseline(baseline);
		}

		if let Some(alignment) = style.alignment {
			_style = _style.alignment(alignment);
		}

		_style.build()
	}
}

#[derive(Copy, Clone)]
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

#[derive(Copy, Clone)]
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

#[derive(Copy, Clone)]
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
