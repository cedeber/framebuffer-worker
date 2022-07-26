import { init, asyncThrottle, Point, Color, Size, Style, Angle } from "./lib/index.js";

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

let otherLayerApi;

layer().then(
	async ({ clear, render, line, circle, polyline, ellipse, triangle, arc, sector, text }) => {
		let cursor;
		let frameCounter = 0;
		let boundingBoxes = new Map();
		let hoverBounding;

		await clear();
		for (let i = 0; i < 9000; i++) {
			let id = `circle-${i}`;
			const diameter = 10;
			const perLine = Math.floor(canvas.width / (diameter + 2)) - 1;
			await circle({
				topLeftPoint: new Point(
					(diameter + 2) * (i % perLine) + 5,
					5 + (diameter + 2) * Math.floor(i / perLine),
				),
				diameter,
				style: new Style(new Color(176, 230, 156), new Color(255, 105, 180), 1),
			}).then((bounding) => {
				if (bounding) boundingBoxes.set(id, bounding);
			});
		}

		await line({
			startPoint: new Point(0, 0),
			endPoint: new Point(canvas.width, canvas.height),
			style: new Style(undefined, new Color(255, 105, 180), 1),
		});
		await ellipse({
			topLeftPoint: new Point(50, 100),
			size: new Size(300, 40),
			style: new Style(new Color(255, 255, 255), new Color(255, 10, 18), 1),
		}).then((bounding) => {
			if (bounding) boundingBoxes.set("elipse", bounding);
		});
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
			style: new Style(undefined, new Color(176, 230, 156), 3),
		}).then((bounding) => {
			if (bounding) boundingBoxes.set("polyline", bounding);
		});
		await triangle({
			vertex1: new Point(10, 64),
			vertex2: new Point(50, 64),
			vertex3: new Point(60, 44),
			style: new Style(new Color(48, 120, 214)),
		}).then((bounding) => {
			if (bounding) boundingBoxes.set("triangle", bounding);
		});
		await arc({
			topLeftPoint: new Point(100, 240),
			diameter: 130,
			angleStart: new Angle(0),
			angleSweep: new Angle(72),
			style: new Style(undefined, new Color(127, 127, 127), 5),
		}).then((bounding) => {
			if (bounding) boundingBoxes.set("arc", bounding);
		});
		await sector({
			topLeftPoint: new Point(80, 260),
			diameter: 130,
			angleStart: new Angle(35),
			angleSweep: new Angle(300),
			style: new Style(new Color(253, 216, 53)),
		}).then((bounding) => {
			if (bounding) boundingBoxes.set("sector", bounding);
		});
		await text({
			position: new Point(3, 12),
			label: frameCounter.toString(),
			size: 9,
			textColor: new Color(33, 33, 33),
		}).then((bounding) => {
			if (bounding) boundingBoxes.set("text", bounding);
		});
		frameCounter++;
		await render();

		canvas.addEventListener(
			"pointermove",
			asyncThrottle(async (event) => {
				hoverBounding = undefined;
				cursor = new Point(event.offsetX, event.offsetY);

				for (const bounding of boundingBoxes.values()) {
					if (bounding.intersect(cursor)) {
						hoverBounding = bounding.as_js();
					}
				}

				await otherLayerApi?.clear();

				if (hoverBounding) {
					await otherLayerApi?.rectangle({
						topLeftPoint: new Point(hoverBounding.top_left.x, hoverBounding.top_left.y),
						size: new Size(hoverBounding.size.width, hoverBounding.size.height),
						style: new Style(undefined, new Color(100, 180, 255), 2),
					});
				}

				await otherLayerApi?.render();
			}, 16),
		);
	},
);

layer().then(async (api) => {
	otherLayerApi = api;
});
