release:
	# Clean
	npx rimraf lib/wasm dist
	npx rimraf lib/*.js lib/*.d.ts lib/*.js.map
    # Build Rust
	npx wasm-pack build --target web --out-dir lib/wasm
	npx rimraf lib/wasm/package.json lib/wasm/README.md lib/wasm/.gitignore # Not a package
	# Unfortunately, a lot of code duplication here, but Firefox still does not support `import` in a Worker
	npx esbuild lib/index.ts lib/worker.ts --format=esm --bundle --minify --outdir=dist
	# Types definition
	npx tsc --project tsconfig.production.json --outDir dist

dev:
	rm -f lib/*.js lib/*.d.ts lib/*.js.map
	cargo build --lib --target wasm32-unknown-unknown
	wasm-bindgen --target web --out-dir lib/wasm target/wasm32-unknown-unknown/debug/canvas.wasm
	wasm-opt -O1 lib/wasm/canvas_bg.wasm -o lib/wasm/canvas_bg.wasm
	npx esbuild lib/*.ts --format=esm --sourcemap --outdir=lib
