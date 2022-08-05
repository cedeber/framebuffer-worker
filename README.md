# Framebuffer Worker

Draw on a Canvas from a Web Worker.

This is definitely not optimized for real-time application, although possible. The main goal is to render a
visualization of millions of data which usually take some seconds to render.

By doing it off-the-main-thread, in a Worker, it will never block the UI.

## How does it work?

As the [`OffscreenCanvas`](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) API is still experimental,
we draw directly in
a [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)
.
The drawing is done via `WebAssembly` thanks to
the [`embedded_graphics`](https://docs.rs/embedded-graphics/latest/embedded_graphics/index.html) Rust crate, which is
instantiated in a `Web Worker`.
That's why everything is _asynchronous_.

## Example

```javascript
import { init, asyncThrottle, Color, Point } from "framebuffer-worker";

const canvas = document.getElementById("canvas");

init(canvas).then((layer) => {
	layer().then(async ({ clear, render, line }) => {
		await clear();
		await line({
			startPoint: new Point(0, 0),
			endPoint: new Point(canvas.width, canvas.height),
			style: {
				strokeColor: new Color(127, 127, 127),
				strokeWidth: 1,
			},
		});
		await render();
	});

	layer().then(async ({ clear, render, line }) => {
		const cb = async (event) => {
			const x = event.offsetX;
			const y = event.offsetY;

			await clear();

			await Promise.all([
				line({
					startPoint: new Point(x, 0),
					endPoint: new Point(x, canvas.height),
					style: {
						strokeColor: new Color(65, 105, 225),
						strokeWidth: 1,
					},
				}),
				line({
					startPoint: new Point(0, y),
					endPoint: new Point(canvas.width, y),
					style: {
						strokeColor: new Color(65, 105, 225),
						strokeWidth: 1,
					},
				}),
			]);

			await render();
		};

		canvas.addEventListener("pointermove", asyncThrottle(cb, 16));
	});
});
```

You can [play with it on StackBlitz](https://stackblitz.com/edit/framebuffer-worker?file=src/main.ts&view=editor).
Open the preview in a new tab because the vite config changes the headers. See bellow.

## Basic

## Clear

Calling `await clear();` will simply fill the `SharedArrayBuffer` with `OxO`.
It is way faster than "drawing" all pixels one by one with a transparent color.

## Render

Call `await render();` everytime you want the pixels to appear on the screen.
It will merge all layers together, by the order of creation. Last layer on top.

## Primitives

You can render all primitives together by using `await Promise.all([..]);`.
It will do the rendering in one go (wasm is not yet multi-threaded) but it will probably not respect the order of drawing.

### Line

```javascript
await line({
	startPoint: new Point(i, 0),
	endPoint: new Point(canvas.width, canvas.height),
	style: {
		// fillColor is not used for lines
		strokeColor: new Color(255, 105, 180),
		strokeWidth: 1,
	},
});
```

### Circle

```javascript
await circle({
	topLeftPoint: new Point(10, 20),
	diameter: 20,
	style: {
		fillColor: new Color(176, 230, 156),
		strokeColor: new Color(255, 105, 180),
		strokeWidth: 2,
	},
});
```

### Rectangle

```javascript
await rectangle({
	topLeftPoint: new Point(50, 100),
	size: new Size(100, 40),
	style: {
		fillColor: new Color(176, 230, 156),
		strokeColor: new Color(255, 105, 180),
		strokeWidth: 1,
	},
});
```

## Layers

Everytime you create a new layer, it will instantiate a new Worker. Every layer has to be _rendered individually_, though.
So the time that every layer will take to render, will never affect the other layers rendering speed.
At every render the layers are merged together, in the order of creation at the moment, so that you do not have to sync between layers yourself.

Currently, the rendering is not optimized if you have multiple real-time layers, because every render call its own `requestAnimationFrame` and merge layers together.
Opacity is not supported at the moment.

## Server configuration

### SharedArrayBuffer support

You need to set two HTTP Headers:

| Header                       | Value        |
| ---------------------------- | ------------ |
| Cross-Origin-Opener-Policy   | same-origin  |
| Cross-Origin-Embedder-Policy | require-corp |

### Vite

You need to configure `vite` to build to ES modules.
You also need to exclude the `framebuffer-worker` module from the dependency pre-bundling as this module is an ES module
and use `import.meta.url` internally to load the worker and wasm files.

Here is also a little plugin to add the _mandatory_ headers to support `SharedArrayBuffer`.

```javascript
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		target: "esnext",
	},
	esbuild: {
		legalComments: "none",
		target: "esnext",
	},
	optimizeDeps: {
		exclude: ["framebuffer-worker"],
		esbuildOptions: {
			target: "esnext",
		},
	},
	plugins: [
		{
			name: "configure-response-headers",
			configureServer: (server) => {
				server.middlewares.use((_req, res, next) => {
					res.setHeader("Cross-Origin-Embedder-Policy", " require-corp");
					res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
					next();
				});
			},
		},
	],
});
```
