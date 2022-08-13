mod objects;

use byteorder::{BigEndian, ReadBytesExt};
use embedded_graphics::pixelcolor::raw::RawU32;
use embedded_graphics::pixelcolor::Rgb888;
use embedded_graphics::{
	mono_font::MonoTextStyle,
	prelude::*,
	primitives::{Circle, Line, Rectangle},
	text::Text,
};
use js_sys::{SharedArrayBuffer, Uint8ClampedArray};
use profont::{
	PROFONT_10_POINT, PROFONT_12_POINT, PROFONT_14_POINT, PROFONT_18_POINT, PROFONT_24_POINT,
	PROFONT_7_POINT, PROFONT_9_POINT,
};
use wasm_bindgen::prelude::*;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen(start)]
pub fn main_wasm() -> Result<(), JsValue> {
	console_error_panic_hook::set_once();
	Ok(())
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
		for Pixel(coord, color) in pixels.into_iter() {
			// Check if the pixel coordinates are out of bounds (negative or greater than
			// (WIDTH,HEIGHT)). `DrawTarget` implementation are required to discard any out of bounds
			// pixels without returning an error or causing a panic.
			if coord.x >= 0
				&& coord.x < self.width as i32
				&& coord.y >= 0 && coord.y < self.height as i32
			{
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

		Self { display }
	}

	#[wasm_bindgen]
	pub fn clear(&mut self) {
		self.display.reset();
	}

	#[wasm_bindgen]
	pub fn line(
		&mut self,
		start_point: objects::Point,
		end_point: objects::Point,
		style: objects::Style,
	) {
		Line::new(start_point.into(), end_point.into())
			.into_styled(style.into())
			.draw(&mut self.display)
			.unwrap();
	}

	#[wasm_bindgen]
	pub fn circle(&mut self, top_left_point: objects::Point, diameter: u32, style: objects::Style) {
		Circle::new(top_left_point.into(), diameter)
			.into_styled(style.into())
			.draw(&mut self.display)
			.unwrap();
	}

	#[wasm_bindgen]
	pub fn rectangle(
		&mut self,
		top_left_point: objects::Point,
		size: objects::Size,
		style: objects::Style,
	) {
		Rectangle::new(top_left_point.into(), size.into())
			.into_styled(style.into())
			.draw(&mut self.display)
			.unwrap();
	}

	#[wasm_bindgen]
	pub fn text(
		&mut self,
		position: objects::Point,
		label: &str,
		size: u8,
		text_color: objects::Color,
		text_style: Option<objects::TextStyle>,
	) {
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
		let text = if let Some(style) = text_style {
			Text::with_text_style(label, position.into(), character_style, style.into())
		} else {
			Text::new(label, position.into(), character_style)
		};

		text.draw(&mut self.display).unwrap();
	}
}
