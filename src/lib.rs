use embedded_graphics::{
	pixelcolor::Rgb888,
	prelude::*,
	primitives::{Circle, Line, PrimitiveStyle, PrimitiveStyleBuilder, Rectangle},
};
use js_sys::{SharedArrayBuffer, Uint8ClampedArray};
use wasm_bindgen::prelude::*;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen(start)]
pub fn main_wasm() -> Result<(), JsValue> {
	console_error_panic_hook::set_once();

	// let window = web_sys::window().expect("no global `window` exists");
	// let document = window.document().expect("should have a document on window");
	// let body = document.body().expect("document should have a body");
	//
	// let val = document.create_element("p")?;
	// val.set_text_content(Some("Hello from Rust!"));
	//
	// body.append_child(&val)?;

	// web_sys::console::log_1(&JsValue::from_str("Hello web-sys"));

	Ok(())
}

// https://docs.rs/embedded-graphics-core/latest/embedded_graphics_core/draw_target/trait.DrawTarget.html
struct ExampleDisplay {
	// framebuffer: [u8; 64 * 64 * 4],
	framebuffer: Uint8ClampedArray,
	// iface: SPI1,
	length: u32,
}

impl ExampleDisplay {
	/// Way faster then .clear()
	fn reset(&mut self) {
		self.framebuffer.fill(0x0, 0, self.length);
	}
}

impl DrawTarget for ExampleDisplay {
	type Color = Rgb888;
	type Error = core::convert::Infallible;

	fn draw_iter<I>(&mut self, pixels: I) -> Result<(), Self::Error>
	where
		I: IntoIterator<Item = Pixel<Self::Color>>,
	{
		for Pixel(coord, color) in pixels.into_iter() {
			// Check if the pixel coordinates are out of bounds (negative or greater than
			// (63,63)). `DrawTarget` implementation are required to discard any out of bounds
			// pixels without returning an error or causing a panic.
			if let Ok((x @ 0..=1719, y @ 0..=799)) = coord.try_into() {
				// Calculate the index in the framebuffer.
				let index: u32 = (x + y * 1720) * 4;

				// self.framebuffer[index as usize] = color.r();
				// self.framebuffer[index as usize + 1] = color.r();
				// self.framebuffer[index as usize + 2] = color.r();
				// self.framebuffer[index as usize + 3] = 0xff;

				self.framebuffer.set_index(index, color.r());
				self.framebuffer.set_index(index + 1, color.g());
				self.framebuffer.set_index(index + 2, color.b());
				self.framebuffer.set_index(index + 3, 0xff);
			}
		}

		Ok(())
	}
}

impl OriginDimensions for ExampleDisplay {
	fn size(&self) -> Size {
		Size::new(1720, 800)
	}
}

#[wasm_bindgen]
pub fn well(what: JsValue, width: u32, height: u32, x: i32, y: i32) -> Result<(), JsValue> {
	let data: SharedArrayBuffer = JsValue::into(what);
	let arr = Uint8ClampedArray::new(&data);

	let length = width * height * 4;
	let mut display = ExampleDisplay {
		framebuffer: arr,
		length,
	};

	display.reset();

	// clear
	let style = PrimitiveStyleBuilder::new()
		.stroke_color(Rgb888::RED)
		.stroke_width(3)
		// .fill_color(Rgb888::WHITE)
		.build();

	let rect = Rectangle::new(Point::new(0, 0), Size::new(1720, 800)).into_styled(style);

	for y in 0..35 {
		for x in 0..75 {
			let circle = Circle::new(Point::new(x * 22, y * 22), 20)
				.into_styled(PrimitiveStyle::with_stroke(Rgb888::BLACK, 1));
			circle.draw(&mut display).unwrap();
		}
	}

	let line_x = Line::new(Point::new(x, 0), Point::new(x, 800))
		.into_styled(PrimitiveStyle::with_stroke(Rgb888::BLUE, 1));

	let line_y = Line::new(Point::new(0, y), Point::new(1720, y))
		.into_styled(PrimitiveStyle::with_stroke(Rgb888::GREEN, 1));

	rect.draw(&mut display).unwrap();
	// circle.draw(&mut display).unwrap();
	line_x.draw(&mut display).unwrap();
	line_y.draw(&mut display).unwrap();

	// for y in 0..height {
	//     let in_top = (y / (height / 2)) == 0;
	//     for x in 0..width {
	//         let in_left = (x / (width / 2)) == 0;
	//         let ix = (y * width + x) * 4;
	//         let (r, g, b) = match (in_top, in_left) {
	//             (true, true) => (0xff, 0x00, 0x00),
	//             (true, false) => (0x00, 0xff, 0x00),
	//             (false, true) => (0x00, 0x00, 0xff),
	//             (false, false) => (0x00, 0x00, 0x00),
	//         };
	//         arr.set_index(ix, r);
	//         arr.set_index(ix + 1, g);
	//         arr.set_index(ix + 2, b);
	//         arr.set_index(ix + 3, 0x77);
	//     }
	// }

	// web_sys::console::log_2(&JsValue::from_str("web-sys"), &data);
	Ok(())
}
