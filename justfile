clean:
	rm -rf lib/wasm
	rm -f lib/*.js lib/*.d.ts lib/*.js.map
	rm -rf dist

release: clean
	cargo build --lib --release --target wasm32-unknown-unknown
	wasm-bindgen --target web --out-dir lib/wasm target/wasm32-unknown-unknown/release/canvas.wasm
	# We just need the Wasm file at the end, as esbuild will bundle the JS output from wasm-bindgen
	mkdir -p dist
	wasm-opt -Os lib/wasm/canvas_bg.wasm -o dist/canvas_bg.wasm
	# Unfortunately, a lot of code duplication here, but Firefox still does not support `import` in a Worker
	npx esbuild lib/index.ts --format=esm --bundle --minify --outfile=dist/index.js
	npx esbuild lib/worker.ts --format=esm --bundle --minify --outfile=dist/worker.js
	# Bundle of Types definition
	npx tsc --project tsconfig.production.json --outFile dist/index.d.ts

dev: clean
	cargo build --lib --target wasm32-unknown-unknown
	wasm-bindgen --target web --out-dir lib/wasm target/wasm32-unknown-unknown/debug/canvas.wasm
	npx esbuild lib/*.ts --format=esm --sourcemap --outdir=lib
