import { init, asyncThrottle, Point, Color } from "./lib/index.js";

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

init(canvas).then(async ({ clear, render, line, circle }) => {
	const draw = async (i = 0) => {
		await line({
			startPoint: new Point(i, 0),
			endPoint: new Point(canvas.width, canvas.height),
			strokeColor: new Color(255, 255, 255),
			strokeWidth: 1,
		});
		await line({
			startPoint: new Point(10 + i, 60),
			endPoint: new Point(30, 40),
			strokeColor: new Color(255, 255, 255),
			strokeWidth: 7,
		});
		await line({
			startPoint: new Point(50 + i, 110),
			endPoint: new Point(270, 40),
			strokeColor: new Color(255, 255, 255),
			strokeWidth: 3,
		});
		await circle({
			topLeftPoint: new Point(10, 10),
			diameter: 20,
			fillColor: new Color(176, 230, 156),
			strokeColor: new Color(255, 189, 156),
			strokeWidth: 2,
		});
	};

	await clear();
	await draw();
	await render();

	const cb = async (event) => {
		const x = event.offsetX;
		const y = event.offsetY;

		await clear();
		await draw();

		// FIXME, The `done` function to validate the execution does not have a UID
		await Promise.all([
			line({
				startPoint: new Point(x, 0),
				endPoint: new Point(x, canvas.height),
				strokeColor: new Color(65, 105, 225),
				strokeWidth: 1,
			}),
			line({
				startPoint: new Point(0, y),
				endPoint: new Point(canvas.width, y),
				strokeColor: new Color(65, 105, 225),
				strokeWidth: 1,
			}),
		]);

		await render();
	};

	canvas.addEventListener("pointermove", asyncThrottle(cb, 16));
});
