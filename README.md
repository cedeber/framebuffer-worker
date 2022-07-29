# Framebuffer Worker

Draw on a Canvas from a Web Worker.

## How does it work?

As the [`OffscreenCanvas`](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) API is still experimental, we draw directly in a [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer).
The drawing is done via `WebAssembly` thanks to the [`embedded_graphics`](https://docs.rs/embedded-graphics/latest/embedded_graphics/index.html) Rust crate, which is instantiated in a `Web Worker`.
That's why everything is _asynchronous_.

## Example

```typescript
import { init, Color, asyncThrottle } from "framebuffer-worker";

const canvas = document.getElementById("canvas");

init(canvas).then(async ({ clear, render, line }) => {
	await clear();
	await line(0, 0, canvas.width, canvas.height, new Color(127, 127, 127), 1);
	await render();

	const cb = async (event) => {
		await clear();
		await line(event.offsetX, 0, event.offsetX, canvas.height);
		await line(0, event.offsetY, canvas.width, event.offsetY);
		await render();
	};

	canvas.addEventListener("pointermove", asyncThrottle(cb, 16));
});
```
