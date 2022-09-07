prepare:
	# Clean
	npx rimraf lib/wasm dist
	npx rimraf lib/*.js lib/*.d.ts lib/*.js.map
	# Build Rust
	npx wasm-pack build --target web --out-dir lib/wasm
	npx rimraf lib/wasm/package.json lib/wasm/README.md lib/wasm/.gitignore # Not a package
	npx cpy lib/wasm/canvas_bg.wasm dist --flat

release: prepare
	# Unfortunately, a lot of code duplication here, but Firefox still does not support `import` in a Worker
	npx esbuild lib/index.ts lib/worker.ts --format=esm --bundle --minify --outdir=dist
	# Types definition
	npx tsc --project tsconfig.production.json --outDir dist

demo: prepare
	# JavaScript
	npx esbuild lib/*.ts --format=esm --outdir=lib
	npx esbuild main.js --format=esm --bundle --minify --outfile=dist/main.js
	npx esbuild lib/worker.ts --format=esm --bundle --minify --outfile=dist/worker.js
	npx cpy index.html dist --flat
	npx cpy serve.json dist --flat

clean:
	rm -rf lib/wasm dist
	rm -f lib/*.js lib/*.d.ts lib/*.js.map

dev: clean
	cargo build --lib --target wasm32-unknown-unknown
	wasm-bindgen --target web --out-dir lib/wasm target/wasm32-unknown-unknown/debug/canvas.wasm
	wasm-opt -O1 lib/wasm/canvas_bg.wasm -o lib/wasm/canvas_bg.wasm
	npx esbuild lib/*.ts --format=esm --sourcemap --outdir=lib
