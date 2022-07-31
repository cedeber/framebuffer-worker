cargo build --lib --release --target wasm32-unknown-unknown
wasm-bindgen --target web --out-dir lib/wasm target/wasm32-unknown-unknown/release/canvas.wasm
