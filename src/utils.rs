use crate::Color;
use embedded_graphics::{
	pixelcolor::Rgb888,
	primitives::{PrimitiveStyle, PrimitiveStyleBuilder},
};

pub fn get_style(
	fill_color: Option<Color>,
	stroke_color: Option<Color>,
	stroke_width: Option<u32>,
) -> PrimitiveStyle<Rgb888> {
	let mut style: PrimitiveStyleBuilder<Rgb888> = PrimitiveStyleBuilder::new();

	if let Some(color) = fill_color {
		style = style.fill_color(color.into());
	}

	if let Some(color) = stroke_color {
		style = style.stroke_color(color.into());
	}

	if let Some(width) = stroke_width {
		style = style.stroke_width(width);
	}

	style.build()
}
