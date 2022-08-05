import { init, asyncThrottle, Point, Color } from "./lib/index.js";
import { Size } from "./lib/objects.js";

// Animate the loading spinner via JavaScript to see if the main thread is not blocked.
const loading = document.getElementById("loading");
let previousTime = 0;
let rotate = 0;

const animate = (time) => {
	if (loading) {
		rotate = (rotate + (time - previousTime) * (30 / 100)) % 360;
		previousTime = time;
		loading.style.transform = `rotate(${rotate}deg)`;
		requestAnimationFrame(animate);
	}
};

requestAnimationFrame(animate);

/** @type HTMLCanvasElement */
const canvas = document.getElementById("canvas");

init(canvas).then((layer) => {
	layer().then(async ({ clear, render, line, circle, rectangle }) => {
		const draw = async (i = 0) => {
			await line({
				startPoint: new Point(i, 0),
				endPoint: new Point(canvas.width, canvas.height),
				style: {
					strokeColor: new Color(255, 105, 180),
					strokeWidth: 1,
				},
			});
			await circle({
				topLeftPoint: new Point(10, 20),
				diameter: 20,
				style: {
					fillColor: new Color(176, 230, 156),
					strokeColor: new Color(255, 105, 180),
					strokeWidth: 2,
				},
			});
			await rectangle({
				topLeftPoint: new Point(50, 100),
				size: new Size(100, 40),
				style: {
					// fillColor: new Color(176, 230, 156),
					strokeColor: new Color(255, 105, 180),
					strokeWidth: 1,
				},
			});
		};

		const cb = async (event) => {
			const random = Math.floor(Math.random() * 25);
			await clear();
			// for (let i = random; i < 1000 + random; i++) {
			await draw();
			// }
			await render();
		};

		setInterval(asyncThrottle(cb), 16);
	});

	layer().then(async ({ clear, render, line, circle }) => {
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
