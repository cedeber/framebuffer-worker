import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	base: "./",
	build: {
		lib: {
			entry: resolve(__dirname, "lib/index.ts"),
			formats: ["es"],
			fileName: "framebuffer-worker",
		},
		sourcemap: true,
	},
	worker: {
		format: "es",
	},
	plugins: [dts()],
});
