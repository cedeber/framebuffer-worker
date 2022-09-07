FROM alpine:latest as builder
RUN apk add --update --no-cache node npm just
WORKDIR app
COPY . .
RUN npm ci
RUN just demo

FROM alpine:latest
RUN apk add --update --no-cache node npm
RUN npm install --global serve
WORKDIR app
COPY --from builder /app/dist /app/
CMD["serve /app/"]
