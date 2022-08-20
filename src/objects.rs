use embedded_graphics::pixelcolor::Rgb888;
use embedded_graphics::{
	geometry::{Point as EgPoint, Size as EgSize},
	primitives::{PrimitiveStyle, PrimitiveStyleBuilder},
	text::{
		Alignment as EgAlignment, Baseline as EgBaseline, TextStyle as EgTextStyle,
		TextStyleBuilder,
	},
};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Copy, Clone, Serialize, Deserialize)]
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

	pub fn as_js(&self) -> JsValue {
		serde_wasm_bindgen::to_value(self).unwrap()
	}
}

impl From<Style> for PrimitiveStyle<Rgb888> {
	fn from(style: Style) -> Self {
		let mut primitive_style: PrimitiveStyleBuilder<Rgb888> = PrimitiveStyleBuilder::new();

		if let Some(color) = style.fill_color {
			primitive_style = primitive_style.fill_color(color.into());
		}

		if let Some(color) = style.stroke_color {
			primitive_style = primitive_style.stroke_color(color.into());
		}

		if let Some(width) = style.stroke_width {
			primitive_style = primitive_style.stroke_width(width);
		}

		primitive_style.build()
	}
}

#[derive(Debug, Copy, Clone, Ord, PartialOrd, Eq, PartialEq, Hash, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum Alignment {
	Left,
	Center,
	Right,
}

impl From<Alignment> for EgAlignment {
	fn from(alignment: Alignment) -> Self {
		match alignment {
			Alignment::Left => EgAlignment::Left,
			Alignment::Center => EgAlignment::Center,
			Alignment::Right => EgAlignment::Right,
		}
	}
}

#[derive(Copy, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum Baseline {
	Top,
	Bottom,
	Middle,
	Alphabetic,
}

impl From<Baseline> for EgBaseline {
	fn from(baseline: Baseline) -> Self {
		match baseline {
			Baseline::Top => EgBaseline::Top,
			Baseline::Bottom => EgBaseline::Bottom,
			Baseline::Middle => EgBaseline::Middle,
			Baseline::Alphabetic => EgBaseline::Alphabetic,
		}
	}
}

#[derive(Copy, Clone, Serialize, Deserialize)]
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
		let alignment = match alignment {
			Some(value) => match value.as_str() {
				"center" => Some(Alignment::Center),
				"right" => Some(Alignment::Right),
				_ => Some(Alignment::Left),
			},
			_ => None,
		};

		// Baseline::Alphabetic is default
		let baseline = match baseline {
			Some(value) => match value.as_str() {
				"top" => Some(Baseline::Top),
				"bottom" => Some(Baseline::Bottom),
				"middle" => Some(Baseline::Middle),
				_ => Some(Baseline::Alphabetic),
			},
			_ => None,
		};

		TextStyle {
			alignment,
			baseline,
		}
	}

	pub fn as_js(&self) -> JsValue {
		serde_wasm_bindgen::to_value(self).unwrap()
	}
}

impl From<TextStyle> for EgTextStyle {
	fn from(style: TextStyle) -> Self {
		let mut text_style = TextStyleBuilder::new();

		if let Some(baseline) = style.baseline {
			text_style = text_style.baseline(baseline.into());
		}

		if let Some(alignment) = style.alignment {
			text_style = text_style.alignment(alignment.into());
		}

		text_style.build()
	}
}

#[derive(Copy, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Color {
	red: u8,
	green: u8,
	blue: u8,
}

#[wasm_bindgen]
impl Color {
	#[wasm_bindgen(constructor)]
	pub fn new(red: u8, green: u8, blue: u8) -> Self {
		Color { red, green, blue }
	}

	pub fn as_js(&self) -> JsValue {
		serde_wasm_bindgen::to_value(self).unwrap()
	}
}

impl From<Color> for Rgb888 {
	fn from(color: Color) -> Self {
		Rgb888::new(color.red, color.green, color.blue)
	}
}

#[derive(Copy, Clone, Serialize, Deserialize)]
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

	pub fn as_js(&self) -> JsValue {
		serde_wasm_bindgen::to_value(self).unwrap()
	}
}

impl From<Point> for EgPoint {
	fn from(point: Point) -> Self {
		EgPoint::new(point.x, point.y)
	}
}

#[derive(Copy, Clone, Serialize, Deserialize)]
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

	pub fn as_js(&self) -> JsValue {
		serde_wasm_bindgen::to_value(self).unwrap()
	}
}

impl From<Size> for EgSize {
	fn from(size: Size) -> Self {
		EgSize::new(size.width, size.height)
	}
}
