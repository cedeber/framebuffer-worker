import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "lib/index.ts"),
			formats: ["es"],
			fileName: "framebuffer-worker",
		},
	},
});
