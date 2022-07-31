import { init, Color, asyncThrottle } from "./js/index.js";

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

init(canvas).then(async ({ clear, render, line }) => {
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
		for (let i = random; i < 400 + random; i++) {
			await draw(i);
		}
		await line(event.offsetX, 0, event.offsetX, canvas.height);
		await line(0, event.offsetY, canvas.width, event.offsetY);
		await render();
	};

	canvas.addEventListener("pointermove", asyncThrottle(cb, 16));
});
