# Framebuffer Worker

Draw on a Canvas from a Web Worker.

This is definitely not optimized for real-time application, although possible. The main goal is to render a visualization of millions of data which usually take some seconds to render.

By doing it off-the-main-thread, in a Worker, it will never block the UI.

## How does it work?

As the [`OffscreenCanvas`](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) API is still experimental, we draw directly in a [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer).
The drawing is done via `WebAssembly` thanks to the [`embedded_graphics`](https://docs.rs/embedded-graphics/latest/embedded_graphics/index.html) Rust crate, which is instantiated in a `Web Worker`.
That's why everything is _asynchronous_.

### SharedArrayBuffer support

You need to set two HTTP Headers:

| Header                       | Value        |
| ---------------------------- | ------------ |
| Cross-Origin-Opener-Policy   | same-origin  |
| Cross-Origin-Embedder-Policy | require-corp |

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

## Vite configuration

You need to configure `vite` to build to ES modules.
You also need to exclude the `framebuffer-worker` module from the dependency pre-bundling as this module is an ES module and use `import.meta.url` internally to load the worker and wasm files.

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
