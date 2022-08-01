import { init, Color, asyncThrottle } from "./lib/index.js";

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
		await line(i, 0, canvas.width, canvas.height, new Color(255, 255, 255), 1);
		await line(10 + i, 60, 30, 40, new Color(255, 255, 255), 7);
		await line(50 + i, 110, 270, 40, new Color(255, 255, 255), 3);
	};

	await clear();
	await draw();
	await render();

	const cb = async (event) => {
		const random = Math.floor(Math.random() * 25);
		await clear();
		// for (let i = random; i < 400 + random; i++) {
		await draw();
		// }

		const x = event.offsetX;
		const y = event.offsetY;

		// FIXME, The `done` function to validate the execution does not have a UID
		await Promise.all([
			line(x, 0, x, canvas.height),
			line(0, y, canvas.width, y),
			circle(x - 10, y - 10, 20, new Color(176, 230, 156), new Color(255, 189, 156), 2),
		]);

		// await line(x, 0, x, canvas.height);
		// await line(0, y, canvas.width, y);
		// await circle(x - 10, y - 10, 20, new Color(176, 230, 156), new Color(255, 189, 156), 2);
		await render();
	};

	canvas.addEventListener("pointermove", asyncThrottle(cb, 16));
});
