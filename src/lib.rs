mod objects;

use embedded_graphics::primitives::Sector;
use embedded_graphics::{
	mono_font::MonoTextStyle,
	pixelcolor::Rgb888,
	prelude::*,
	primitives::{Arc, Circle, Ellipse, Line, Polyline, Rectangle, RoundedRectangle, Triangle},
	text::Text,
};
use js_sys::{SharedArrayBuffer, Uint8ClampedArray};
use profont::{
	PROFONT_10_POINT, PROFONT_12_POINT, PROFONT_14_POINT, PROFONT_18_POINT, PROFONT_24_POINT,
	PROFONT_7_POINT, PROFONT_9_POINT,
};
use serde::de::DeserializeOwned;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn main_wasm() -> Result<(), JsValue> {
	console_error_panic_hook::set_once();
	Ok(())
}

fn from_js<T>(value: JsValue) -> T
where
	T: DeserializeOwned,
{
	serde_wasm_bindgen::from_value::<T>(value).unwrap()
}

fn _from_optional_js<T>(value: JsValue) -> Option<T>
where
	T: DeserializeOwned,
{
	if value.is_undefined() {
		None
	} else {
		Some(from_js::<T>(value))
	}
}

fn is_inside(container: &Rectangle, inner_box: &Rectangle) -> bool {
	!container.intersection(inner_box).is_zero_sized()
}

// https://docs.rs/embedded-graphics-core/latest/embedded_graphics_core/draw_target/trait.DrawTarget.html
struct FrameBufferDisplay {
	framebuffer: Uint8ClampedArray,
	length: u32,
	width: u32,
	height: u32,
}

impl FrameBufferDisplay {
	/// Way faster then .clear()
	fn reset(&mut self) {
		self.framebuffer.fill(0x0, 0, self.length);
	}
}

impl DrawTarget for FrameBufferDisplay {
	type Color = Rgb888;
	type Error = core::convert::Infallible;

	fn draw_iter<I>(&mut self, pixels: I) -> Result<(), Self::Error>
	where
		I: IntoIterator<Item = Pixel<Self::Color>>,
	{
		let bounding_box = Rectangle::new(Point::new(0, 0), self.size());
		for Pixel(coord, color) in pixels.into_iter() {
			// Check if the pixel coordinates are out of bounds (negative or greater than
			// (WIDTH,HEIGHT)). `DrawTarget` implementation are required to discard any out of bounds
			// pixels without returning an error or causing a panic.
			if bounding_box.contains(coord) {
				// Calculate the index in the framebuffer.
				let index: u32 = (coord.x as u32 + coord.y as u32 * self.width) * 4;

				self.framebuffer.set_index(index, color.r());
				self.framebuffer.set_index(index + 1, color.g());
				self.framebuffer.set_index(index + 2, color.b());
				self.framebuffer.set_index(index + 3, 0xff);
			}
		}

		Ok(())
	}
}

impl OriginDimensions for FrameBufferDisplay {
	fn size(&self) -> Size {
		Size::new(self.width, self.height)
	}
}

#[wasm_bindgen]
pub struct Drawing {
	display: FrameBufferDisplay,
	bounding_box: Rectangle,
}

#[wasm_bindgen]
impl Drawing {
	#[wasm_bindgen(constructor)]
	pub fn new(sab: JsValue, width: u32, height: u32) -> Self {
		let shared_array_buffer: SharedArrayBuffer = JsValue::into(sab);
		let framebuffer = Uint8ClampedArray::new(&shared_array_buffer);
		let length = width * height * 4;
		let display = FrameBufferDisplay {
			framebuffer,
			length,
			width,
			height,
		};
		let bounding_box = Rectangle::new(Point::new(0, 0), Size::new(width, height));

		Self {
			display,
			bounding_box,
		}
	}

	pub fn clear(&mut self) {
		self.display.reset();
	}

	pub fn line(
		&mut self,
		start_point: JsValue,
		end_point: JsValue,
		style: JsValue,
	) -> Option<objects::Rectangle> {
		let start_point: objects::Point = from_js(start_point);
		let end_point: objects::Point = from_js(end_point);
		let style: objects::Style = from_js(style);

		let line = Line::new(start_point.into(), end_point.into());
		let bounding_box = line.bounding_box();

		if is_inside(&self.bounding_box, &bounding_box) {
			line.into_styled(style.into())
				.draw(&mut self.display)
				.unwrap();

			Some(bounding_box.into())
		} else {
			None
		}
	}

	pub fn circle(
		&mut self,
		top_left_point: JsValue,
		diameter: u32,
		style: JsValue,
	) -> Option<objects::Rectangle> {
		let top_left_point: objects::Point = from_js(top_left_point);
		let style: objects::Style = from_js(style);

		let circle = Circle::new(top_left_point.into(), diameter);
		let bounding_box = circle.bounding_box();

		if is_inside(&self.bounding_box, &bounding_box) {
			circle
				.into_styled(style.into())
				.draw(&mut self.display)
				.unwrap();

			Some(bounding_box.into())
		} else {
			None
		}
	}

	pub fn rectangle(
		&mut self,
		top_left_point: JsValue,
		size: JsValue,
		style: JsValue,
		radius: Option<u32>,
	) -> Option<objects::Rectangle> {
		let top_left_point: objects::Point = from_js(top_left_point);
		let size: objects::Size = from_js(size);
		let style: objects::Style = from_js(style);

		let rectangle = Rectangle::new(top_left_point.into(), size.into());
		let bounding_box = rectangle.bounding_box();

		if is_inside(&self.bounding_box, &bounding_box) {
			if let Some(radius) = radius {
				RoundedRectangle::with_equal_corners(rectangle, Size::new(radius, radius))
					.into_styled(style.into())
					.draw(&mut self.display)
					.unwrap();
			} else {
				rectangle
					.into_styled(style.into())
					.draw(&mut self.display)
					.unwrap();
			}

			Some(bounding_box.into())
		} else {
			None
		}
	}

	pub fn rounded_rectangle(
		&mut self,
		top_left_point: JsValue,
		size: JsValue,
		style: JsValue,
		corners: JsValue,
	) -> Option<objects::Rectangle> {
		let top_left_point: objects::Point = from_js(top_left_point);
		let size: objects::Size = from_js(size);
		let style: objects::Style = from_js(style);
		let corners: objects::Corners = from_js(corners);

		let rectangle = Rectangle::new(top_left_point.into(), size.into());
		let bounding_box = rectangle.bounding_box();

		if is_inside(&self.bounding_box, &bounding_box) {
			RoundedRectangle::new(rectangle, corners.into())
				.into_styled(style.into())
				.draw(&mut self.display)
				.unwrap();

			Some(bounding_box.into())
		} else {
			None
		}
	}

	pub fn arc(
		&mut self,
		top_left_point: JsValue,
		diameter: u32,
		angle_start: JsValue,
		angle_sweep: JsValue,
		style: JsValue,
	) -> Option<objects::Rectangle> {
		let top_left_point: objects::Point = from_js(top_left_point);
		let angle_start: objects::Angle = from_js(angle_start);
		let angle_sweep: objects::Angle = from_js(angle_sweep);
		let style: objects::Style = from_js(style);

		let arc = Arc::new(
			top_left_point.into(),
			diameter,
			angle_start.into(),
			angle_sweep.into(),
		);
		let bounding_box = arc.bounding_box();

		if is_inside(&self.bounding_box, &bounding_box) {
			arc.into_styled(style.into())
				.draw(&mut self.display)
				.unwrap();

			Some(bounding_box.into())
		} else {
			None
		}
	}

	pub fn sector(
		&mut self,
		top_left_point: JsValue,
		diameter: u32,
		angle_start: JsValue,
		angle_sweep: JsValue,
		style: JsValue,
	) -> Option<objects::Rectangle> {
		let top_left_point: objects::Point = from_js(top_left_point);
		let angle_start: objects::Angle = from_js(angle_start);
		let angle_sweep: objects::Angle = from_js(angle_sweep);
		let style: objects::Style = from_js(style);

		let sector = Sector::new(
			top_left_point.into(),
			diameter,
			angle_start.into(),
			angle_sweep.into(),
		);
		let bounding_box = sector.bounding_box();

		if is_inside(&self.bounding_box, &bounding_box) {
			sector
				.into_styled(style.into())
				.draw(&mut self.display)
				.unwrap();

			Some(bounding_box.into())
		} else {
			None
		}
	}

	pub fn ellipse(
		&mut self,
		top_left_point: JsValue,
		size: JsValue,
		style: JsValue,
	) -> Option<objects::Rectangle> {
		let top_left_point: objects::Point = from_js(top_left_point);
		let size: objects::Size = from_js(size);
		let style: objects::Style = from_js(style);

		let ellipse = Ellipse::new(top_left_point.into(), size.into());
		let bounding_box = ellipse.bounding_box();

		if is_inside(&self.bounding_box, &bounding_box) {
			ellipse
				.into_styled(style.into())
				.draw(&mut self.display)
				.unwrap();

			Some(bounding_box.into())
		} else {
			None
		}
	}

	pub fn triangle(
		&mut self,
		vertex1: JsValue,
		vertex2: JsValue,
		vertex3: JsValue,
		style: JsValue,
	) -> Option<objects::Rectangle> {
		let vertex1: objects::Point = from_js(vertex1);
		let vertex2: objects::Point = from_js(vertex2);
		let vertex3: objects::Point = from_js(vertex3);
		let style: objects::Style = from_js(style);

		let triangle = Triangle::new(vertex1.into(), vertex2.into(), vertex3.into());
		let bounding_box = triangle.bounding_box();

		if is_inside(&self.bounding_box, &bounding_box) {
			triangle
				.into_styled(style.into())
				.draw(&mut self.display)
				.unwrap();

			Some(bounding_box.into())
		} else {
			None
		}
	}

	pub fn polyline(&mut self, points: JsValue, style: JsValue) -> Option<objects::Rectangle> {
		let points: Vec<objects::Point> = serde_wasm_bindgen::from_value(points).unwrap();
		let points: Vec<Point> = points.iter().map(|point| (*point).into()).collect();
		let style: objects::Style = serde_wasm_bindgen::from_value(style).unwrap();

		let polyline = Polyline::new(points.as_slice());
		let bounding_box = polyline.bounding_box();

		if is_inside(&self.bounding_box, &bounding_box) {
			polyline
				.into_styled(style.into())
				.draw(&mut self.display)
				.unwrap();

			Some(bounding_box.into())
		} else {
			None
		}
	}

	pub fn text(
		&mut self,
		position: JsValue,
		label: &str,
		size: u8,
		text_color: JsValue,
		text_style: JsValue,
	) -> Option<objects::Rectangle> {
		let position: objects::Point = serde_wasm_bindgen::from_value(position).unwrap();
		let text_color: objects::Color = serde_wasm_bindgen::from_value(text_color).unwrap();
		let text_style: Option<objects::TextStyle> = if text_style.is_undefined() {
			None
		} else {
			Some(serde_wasm_bindgen::from_value::<objects::TextStyle>(text_style).unwrap())
		};
		let font = match size {
			u8::MIN..=7 => PROFONT_7_POINT,
			8..=9 => PROFONT_9_POINT,
			10 => PROFONT_10_POINT,
			11..=12 => PROFONT_12_POINT,
			13..=14 => PROFONT_14_POINT,
			15..=18 => PROFONT_18_POINT,
			19..=u8::MAX => PROFONT_24_POINT,
		};

		let character_style: MonoTextStyle<Rgb888> = MonoTextStyle::new(&font, text_color.into());
		let text = if let Some(styl) = text_style {
			Text::with_text_style(label, position.into(), character_style, styl.into())
		} else {
			Text::new(label, position.into(), character_style)
		};

		let bounding_box = text.bounding_box();

		if is_inside(&self.bounding_box, &bounding_box) {
			text.draw(&mut self.display).unwrap();
			Some(bounding_box.into())
		} else {
			None
		}
	}
}
