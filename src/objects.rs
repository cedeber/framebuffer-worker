use embedded_graphics::pixelcolor::Rgb888;
use embedded_graphics::primitives::{CornerRadii, CornerRadiiBuilder};
use embedded_graphics::{
	geometry::{Angle as EgAngle, Point as EgPoint, Size as EgSize},
	primitives::{PrimitiveStyle, PrimitiveStyleBuilder, Rectangle as EgRectangle},
	text::{
		Alignment as EgAlignment, Baseline as EgBaseline, TextStyle as EgTextStyle,
		TextStyleBuilder,
	},
};
use num::integer::sqrt;
use num::{abs, pow};
use serde::{Deserialize, Serialize};
use std::cmp::min;
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

	pub fn distance(&self, other_point: &Point) -> i32 {
		// Calculate the distance using the Pythagorean Theorem (a^2 + b^2 = c^2)
		let distance_squared = pow(self.x - other_point.x, 2) + pow(self.y - other_point.y, 2);
		sqrt(distance_squared)
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

#[derive(Copy, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Corners {
	top_left: Size,
	top_right: Size,
	bottom_right: Size,
	bottom_left: Size,
}

#[wasm_bindgen]
impl Corners {
	#[wasm_bindgen(constructor)]
	pub fn new(top_left: Size, top_right: Size, bottom_right: Size, bottom_left: Size) -> Self {
		Corners {
			top_left,
			top_right,
			bottom_right,
			bottom_left,
		}
	}

	pub fn as_js(&self) -> JsValue {
		serde_wasm_bindgen::to_value(self).unwrap()
	}
}

impl From<Corners> for CornerRadii {
	fn from(corners: Corners) -> Self {
		CornerRadiiBuilder::new()
			.top_left(corners.top_left.into())
			.top_right(corners.top_right.into())
			.bottom_right(corners.bottom_right.into())
			.bottom_left(corners.bottom_left.into())
			.build()
	}
}

#[derive(Copy, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Angle {
	degree: f32,
}

#[wasm_bindgen]
impl Angle {
	#[wasm_bindgen(constructor)]
	pub fn new(degree: f32) -> Self {
		Angle { degree }
	}

	pub fn as_js(&self) -> JsValue {
		serde_wasm_bindgen::to_value(self).unwrap()
	}
}

impl From<Angle> for EgAngle {
	fn from(angle: Angle) -> Self {
		EgAngle::from_degrees(angle.degree)
	}
}

#[derive(Copy, Clone, Serialize, Deserialize)]
#[wasm_bindgen]
pub struct Rectangle {
	top_left: Point,
	size: Size,
}

#[wasm_bindgen]
impl Rectangle {
	#[wasm_bindgen(constructor)]
	pub fn new(top_left: Point, size: Size) -> Self {
		Rectangle { top_left, size }
	}

	pub fn as_js(&self) -> JsValue {
		serde_wasm_bindgen::to_value(self).unwrap()
	}

	pub fn collide(&self, other_box: &Rectangle) -> bool {
		// FIXME dangerous casting
		!(self.top_left.y + (self.size.height as i32) < other_box.top_left.y
			|| self.top_left.y > other_box.top_left.y + (other_box.size.height as i32)
			|| self.top_left.x + (self.size.width as i32) < other_box.top_left.x
			|| self.top_left.x > other_box.top_left.x + (other_box.size.width as i32))
	}

	pub fn intersect(&self, point: &Point) -> bool {
		self.collide(&Rectangle::new(*point, Size::new(1, 1)))
	}

	pub fn distance(&self, point: &Point) -> i32 {
		// FIXME dangerous casting
		// Both boxes collide
		if self.intersect(point) {
			return 0;
		}

		// Aligned horizontally
		if point.y >= self.top_left.y && point.y <= self.top_left.y + (self.size.height as i32) {
			let right = abs(self.top_left.x + (self.size.width as i32) - point.x);
			let left = abs(self.top_left.x - point.x);
			return min(right, left);
		}

		// Aligned vertically
		if point.x >= self.top_left.x && point.x <= self.top_left.x + (self.size.width as i32) {
			let top = abs(self.top_left.y - point.y);
			let bottom = abs(self.top_left.y + (self.size.height as i32) - point.y);
			return min(top, bottom);
		}

		// Distances from the corners
		let top_left = self.top_left.distance(point);
		let top_right =
			Point::new(self.top_left.x + (self.size.width as i32), self.top_left.y).distance(point);
		let bottom_right = Point::new(
			self.top_left.x + (self.size.width as i32),
			self.top_left.y + (self.size.height as i32),
		)
		.distance(point);
		let bottom_left = Point::new(self.top_left.x, self.top_left.y + (self.size.height as i32))
			.distance(point);

		min(min(top_left, top_right), min(bottom_right, bottom_left))
	}
}

impl From<Rectangle> for EgRectangle {
	fn from(rectangle: Rectangle) -> Self {
		EgRectangle::new(rectangle.top_left.into(), rectangle.size.into())
	}
}

impl From<EgRectangle> for Rectangle {
	fn from(rectangle: EgRectangle) -> Self {
		Rectangle::new(
			Point::new(rectangle.top_left.x, rectangle.top_left.y),
			Size::new(rectangle.size.width, rectangle.size.height),
		)
	}
}
