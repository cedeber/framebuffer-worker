FROM rust:alpine as builder
RUN apk add --update --no-cache build-base musl-dev libc-dev openssl-dev binaryen curl nodejs npm just
RUN rustup target add wasm32-unknown-unknown
RUN cargo install -f wasm-bindgen-cli
WORKDIR /app
COPY . .
RUN npm clean-install
RUN just docker

FROM alpine:latest
RUN apk add --update --no-cache python3
WORKDIR /app
COPY --from=builder /app/dist /app/
CMD ["python3", "/app/server.py"]
