cargo build --lib --release --target wasm32-unknown-unknown
wasm-bindgen --target web --out-dir lib/wasm target/wasm32-unknown-unknown/release/canvas.wasm
wasm-opt -Os lib/wasm/canvas_bg.wasm -o lib/wasm/canvas_bg.wasm
