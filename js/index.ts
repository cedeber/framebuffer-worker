import { throttle } from "./utils.js";

const init = (canvas: HTMLCanvasElement) => {
	const ctx = canvas.getContext("2d")!;

	const WIDTH = canvas.width;
	const HEIGHT = canvas.height;

	let sab = new SharedArrayBuffer(WIDTH * HEIGHT * 4);
	var typedArr = new Uint8ClampedArray(sab);
	const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });

	let isWorking = false;

	[
		"mouseenter",
		"mousedown",
		"mousemove",
		"mouseup",
		"mousedown",
		"wheel",
		"contextmenu",
		"pointerdown",
		"pointermove",
		"pointerup",
		"pointercancel",
		"lostpointercapture",
	].forEach((eventName) => {
		const debCb = throttle((e) => {
			// we may miss the last frame on move here (if drawing >16ms)
			if (!isWorking && eventName === "pointermove") {
				worker.postMessage({
					eventName,
					event: {
						x: e.offsetX,
						y: e.offsetY,
						type: e.type,
					},
				});
				isWorking = true;
			}
		}, 16);
		canvas.addEventListener(eventName, debCb);
	});

	worker.addEventListener("message", ({ data }) => {
		if (data === "ready") {
			worker.postMessage(sab);
			worker.postMessage("draw");
			isWorking = false;
		} else if (data === "reload") {
			isWorking = false;
			requestAnimationFrame(() => {
				// console.log(WIDTH, HEIGHT, typedArr);
				const fb = typedArr.slice(0);
				const start = performance.now();
				const imgData = new ImageData(fb, WIDTH, HEIGHT);
				ctx.putImageData(imgData, 0, 0);

				// const imgData2 = new ImageData(fb, WIDTH, HEIGHT);
				// ctx.putImageData(imgData2, 100, 100);

				const end = performance.now();
				console.log("render", `${(end - start).toFixed(0)}ms`);
			});
		}
	});
};

export { init };
