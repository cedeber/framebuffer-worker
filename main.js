import { init, asyncThrottle, Point, Color, Size, Style, Corners } from "./lib/index.js";

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
const layer = await init(canvas);

layer().then(async ({ clear, render, line, circle, rounded_rectangle, polyline, ellipse }) => {
	const draw = async (i = 0) => {
		await Promise.all([
			circle({
				topLeftPoint: new Point(10, 20),
				diameter: 20,
				style: new Style(new Color(176, 230, 156), new Color(255, 105, 180), 2),
			}),
			line({
				startPoint: new Point(i, 0),
				endPoint: new Point(canvas.width, canvas.height),
				style: new Style(undefined, new Color(255, 105, 180), 1),
			}),
			ellipse({
				topLeftPoint: new Point(50, 100),
				size: new Size(300, 40),
				style: new Style(new Color(255, 255, 255), new Color(255, 10, 18), 1),
			}),
			polyline({
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
				style: new Style(undefined, new Color(176, 230, 156), 3),
			}),
		]);
	};

	const cb = async (event) => {
		const random = Math.floor(Math.random() * 25);
		await clear();
		for (let i = random; i < 100 + random; i++) {
			await draw(i);
		}
		await render();
	};

	setInterval(asyncThrottle(cb), 16);
});

layer().then(async ({ clear, render, line, text }) => {
	const cb = async (event) => {
		const x = event.offsetX;
		const y = event.offsetY;

		await clear();

		const lineStyle = new Style(undefined, new Color(65, 105, 225), 1);

		await Promise.all([
			text({
				position: new Point(x + 3, y - 3),
				label: `${x.toFixed()}-${y.toFixed()}`,
				size: 12,
				textColor: new Color(33, 33, 33),
			}),
			line({
				startPoint: new Point(x, 0),
				endPoint: new Point(x, canvas.height),
				style: lineStyle,
			}),
			line({
				startPoint: new Point(0, y),
				endPoint: new Point(canvas.width, y),
				style: lineStyle,
			}),
		]);

		await render();
	};

	canvas.addEventListener("pointermove", asyncThrottle(cb, 16));
});
