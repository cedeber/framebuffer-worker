# Framebuffer Worker

Draw on a Canvas from a Web Worker.

This is definitely not optimized for real-time application, although possible. The main goal is to render a
visualization of millions of data which usually take some seconds to render.

By doing it off-the-main-thread, in a Worker, it will never block the UI.

[![demo](https://img.shields.io/badge/demo-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://framebuffer-worker.dev.cedeber.fr)
[![npm](https://img.shields.io/npm/v/framebuffer-worker?logo=npm&style=for-the-badge&color=success)](https://www.npmjs.com/package/framebuffer-worker)

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
import { init, asyncThrottle, Style, Color, Point } from "framebuffer-worker";

const canvas = document.getElementById("canvas");
const layer = await init(canvas);

layer().then(async ({ clear, render, line }) => {
  await clear();
  await line({
    startPoint: new Point(0, 0),
    endPoint: new Point(canvas.width, canvas.height),
    style: new Style(undefined, new Color(127, 127, 127), 1),
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
        style: new Style(undefined, new Color(65, 105, 225), 1),
      }),
      line({
        startPoint: new Point(0, y),
        endPoint: new Point(canvas.width, y),
        style: new Style(undefined, new Color(65, 105, 225), 1),
      }),
    ]);

    await render();
  };

  canvas.addEventListener("pointermove", asyncThrottle(cb, 16));
});
```

You can [play with it on StackBlitz](https://stackblitz.com/edit/framebuffer-worker?file=src/main.ts&view=editor).
Open the preview in a new tab because the vite config changes the headers. See bellow.

## Basics

### Layers

Every time you create a new layer, it will instantiate a new Worker. Every layer has to be _rendered individually_,
though.
So the time that every layer will take to render, will never affect the other layers rendering speed.
At every render the layers are merged together, in the order of creation at the moment, so that you do not have to sync
between layers yourself.

Currently, the rendering is not optimized if you have multiple real-time layers, because every render call its
own `requestAnimationFrame` and merge layers together.
Opacity is not supported at the moment.

```javascript
const canvas = document.getElementById("canvas");
const layer = await init(canvas);

layer().then(async ({ clear, render, line, circle, rectangle }) => {
  // -- snip --
});

// OR

const { clear, render, line, circle, rectangle } = await layer();
```

### Clear

Calling `await clear();` will simply fill the `SharedArrayBuffer` with `OxO`.
It is way faster than "drawing" all pixels one by one with a specific color.
Colors are defined as `(red, green, blue, alpha)`. So here it will be a transparent black.

### Render

Call `await render();` every time you want the pixels to appear on the screen.
It will merge all layers together, by the order of creation. Last layer on top.

Although at every drawings (`clear`, `line`, ...), the buffer is modified, we keep a copy of the previous one to draw
it, until you call `render`.

## Primitives

### Line

```javascript
await line({
  startPoint: new Point(0, 0),
  endPoint: new Point(canvas.width, canvas.height),
  // no fillColor for the line
  style: new Style(undefined, new Color(255, 105, 180), 1),
});
```

### Circle

```javascript
await circle({
  topLeftPoint: new Point(10, 20),
  diameter: 20,
  style: new Style(new Color(176, 230, 156), new Color(255, 105, 180), 2),
});
```

### Rectangle

```javascript
await rectangle({
  topLeftPoint: new Point(50, 100),
  size: new Size(100, 40),
  style: new Style(new Color(176, 230, 156), new Color(255, 105, 180), 1),
  radius: 3, //optional
});
```

### Rounded Rectangle

```javascript
await rounded_rectangle({
  topLeftPoint: new Point(50, 100),
  size: new Size(300, 40),
  style: new Style(new Color(255, 255, 255), new Color(255, 10, 18), 1),
  corners: new Corners(new Size(3, 6), new Size(9, 12), new Size(10, 10), new Size(4, 4)),
});
```

### Ellipse

```javascript
await ellipse({
  topLeftPoint: new Point(10, 20),
  size: new Size(300, 40),
  style: new Style(new Color(176, 230, 156), new Color(255, 105, 180), 2),
});
```

### Arc

```javascript
await arc({
  topLeftPoint: new Point(100, 240),
  diameter: 130,
  angleStart: new Angle(0),
  angleSweep: new Angle(72),
  // no fillColor for the polyline
  style: new Style(undefined, new Color(127, 127, 127), 5),
});
```

### Sector

```javascript
await sector({
  topLeftPoint: new Point(80, 260),
  diameter: 130,
  angleStart: new Angle(35),
  angleSweep: new Angle(300),
  style: new Style(new Color(253, 216, 53)),
});
```

### Triangle

```javascript
await triangle({
  vertex1: new Point(10, 64),
  vertex2: new Point(50, 64),
  vertex3: new Point(60, 44),
  style: new Style(new Color(48, 120, 214)),
});
```

### Polyline

```javascript
await polyline({
  points: [
    new Point(10, 64),
    new Point(50, 64),
    new Point(60, 44),
    new Point(70, 64),
    new Point(80, 64),
    new Point(90, 74),
    new Point(100, 10),
    new Point(110, 84),
    new Point(120, 64),
    new Point(300, 64),
  ],
  // no fillColor for the polyline
  style: new Style(undefined, new Color(176, 230, 156), 3),
});
```

### Text

Only a single monospaced font is available: [ProFont](https://tobiasjung.name/profont/).
There is no italic nor bold version. But the bigger the font, the bolder.

Only few sizes are available: 7, 9, 10, 12, 14, 18, and 24 pixels. You can see the rendering on
the [GitHub page](https://github.com/wezm/profont).

The `textStyle` argument is _optional_. The default alignment is `left` and the default baseline is `alphabetic`.

```javascript
await text({
  position: new Point(20, 20),
  label: `Hello, world!`,
  size: 9,
  textColor: new Color(33, 33, 33),
  textStyle: new TextStyle(Alignment.Center, Baseline.Middle), // optional
});
```

## Server configuration

### SharedArrayBuffer support

You need to set two HTTP Headers:

| Header                       | Value        |
| ---------------------------- | ------------ |
| Cross-Origin-Opener-Policy   | same-origin  |
| Cross-Origin-Embedder-Policy | require-corp |

### Vite

You need to exclude the `framebuffer-worker` module from the dependency pre-bundling as this module is an ES module
and use `import.meta.url` internally to load the worker and wasm files.

You also need to set the _mandatory headers_ to support `SharedArrayBuffer`.

```javascript
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["framebuffer-worker"],
  },
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
});
```
