mod objects;

use embedded_graphics::{
	pixelcolor::Rgb888,
	prelude::*,
	primitives::{Circle, Line, Rectangle},
};
use js_sys::{SharedArrayBuffer, Uint8ClampedArray};
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
}
