import init from "./pkg/canvas.js";

const loading = document.getElementById("loading");
let previousTime = 0;
let rotate = 0;
const animate = (time) => {
	rotate = (rotate + (time - previousTime) * (30 / 100)) % 360;
	previousTime = time;
	loading.style.transform = `rotate(${rotate}deg)`;
	requestAnimationFrame(animate);
};

requestAnimationFrame(animate);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let sab = new SharedArrayBuffer(WIDTH * HEIGHT * 4);
var typedArr = new Uint8ClampedArray(sab);
const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });

function debounce(func, delay) {
	let timer;

	return function (...args) {
		clearTimeout(timer);
		timer = window.setTimeout(func.bind(this, ...args), delay);
	};
}

function throttle(func, delay) {
	let start = performance.now();

	return function (...args) {
		if (performance.now() - start > delay) {
			start = performance.now();
			return func.call(this, ...args);
		}
	};
}

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
