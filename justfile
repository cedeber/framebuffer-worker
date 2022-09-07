clean:
	rm -rf lib/wasm dist lib/*.js lib/*.d.ts lib/*.js.map

docker: clean
	cargo build --release --lib --target wasm32-unknown-unknown
	wasm-bindgen --target web --out-dir lib/wasm target/wasm32-unknown-unknown/debug/canvas.wasm
	wasm-opt -Os lib/wasm/canvas_bg.wasm -o lib/wasm/canvas_bg.wasm
	npx esbuild lib/*.ts --format=esm --outdir=lib
	npx esbuild main.js --format=esm --bundle --minify --outfile=dist/main.js
	npx esbuild lib/worker.ts --format=esm --bundle --minify --outfile=dist/worker.js
	cp lib/wasm/canvas_bg.wasm dist/
	cp index.html dist
	cp server.py dist

release: clean
	wasm-pack build --target web --out-dir lib/wasm
	rm -f lib/wasm/package.json lib/wasm/README.md lib/wasm/.gitignore
	mkdir dist/
	cp lib/wasm/canvas_bg.wasm dist/
	npx esbuild lib/index.ts lib/worker.ts --format=esm --bundle --minify --outdir=dist
	npx tsc --project tsconfig.production.json --outDir dist

dev: clean
	cargo build --lib --target wasm32-unknown-unknown
	wasm-bindgen --target web --out-dir lib/wasm target/wasm32-unknown-unknown/debug/canvas.wasm
	wasm-opt -O1 lib/wasm/canvas_bg.wasm -osm lib/wasm/canvas_bg.wasm
	npx esbuild lib/*.ts --format=esm --sourcemap --outdir=lib
