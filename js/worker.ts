import init, { well } from "./wasm/canvas.js";

(init as any)().then(() => {
	let sab: SharedArrayBuffer;

	self.onmessage = ({ data }) => {
		if (typeof data !== "string" && !data.eventName) {
			sab = data;
		} else if (data.eventName === "pointermove") {
			const start = performance.now();
			well(sab, 1720, 800, Math.floor(data.event.x), Math.floor(data.event.y));
			const end = performance.now();
			console.log("drawing", `${(end - start).toFixed(0)}ms`);
			self.postMessage("reload");
		} else if (!data.eventName) {
			well(sab, 1720, 800, 0, 0);
			self.postMessage("reload");
		}
	};

	self.postMessage("ready");
});
