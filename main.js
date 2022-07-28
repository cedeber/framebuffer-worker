import { init, Color } from "./js/index.js";

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

init(canvas).then(({ reset, paint, line }) => {
	const draw = () => {
		void line(0, 0, canvas.width, canvas.height, new Color(255, 255, 255), 1);
		void line(10, 10, 30, 40, new Color(255, 255, 255), 7);
		void line(50, 80, 270, 40, new Color(255, 255, 255), 3);
	};

	draw();
	paint();

	canvas.addEventListener("pointermove", (event) => {
		reset();
		draw();
		line(event.offsetX, 0, event.offsetX, canvas.height).then(() => {
			console.log("x drawn");
		});
		void line(0, event.offsetY, canvas.width, event.offsetY);
		paint();
	});
});
