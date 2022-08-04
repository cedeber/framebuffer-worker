/**
 * Throttle a function but wait that the Promise is resolved before running the next one
 * @see https://underscorejs.org/docs/modules/throttle.html
 */
function asyncThrottle(func: (...args: any[]) => Promise<unknown>, wait = 300) {
	let timeout: number | undefined;
	let result: unknown;
	let previous = 0;
	let argsList: any[] | null = null;
	let isRunning = false;

	const throttled = async function (this: any, ...args: any[]) {
		if (isRunning) return;

		const _now = performance.now();
		const remaining = wait - (_now - previous);
		argsList = args;

		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = undefined;
			}
			previous = _now;
			isRunning = true;
			result = await func.call(this, ...argsList);
			isRunning = false;
			if (!timeout) argsList = null;
		} else if (!timeout) {
			isRunning = true;
			timeout = setTimeout(async () => {
				previous = performance.now();
				timeout = undefined;
				result = await func.call(this, ...argsList);
				isRunning = false;
				if (!timeout) argsList = null;
			}, remaining);
		}

		return result;
	};

	throttled.cancel = () => {
		clearTimeout(timeout);
		previous = 0;
		timeout = undefined;
		argsList = null;
	};

	return throttled;
}

const uid = (): string => {
	return Math.random().toString(36).substring(2);
};

// TODO We should probably go bin/hex within a single loop for performance?
const mergeImage = (layers: Uint8ClampedArray[]): Uint8ClampedArray => {
	const length = layers[0].length;
	let final = new Uint8ClampedArray(length);

	for (let i = 0; i < length; i = i + 4) {
		for (const layer of layers) {
			const alpha = layer[i + 3];
			if (alpha === 0xff) {
				final[i] = layer[i];
				final[i + 1] = layer[i + 1];
				final[i + 2] = layer[i + 2];
				final[i + 3] = 0xff;
			}
		}
	}

	return final;
};

export { asyncThrottle, uid, mergeImage };
