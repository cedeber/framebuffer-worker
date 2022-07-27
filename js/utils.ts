function debounce(func: (...args: any[]) => unknown, delay = 300) {
	let timer: number;

	return function (this: any, ...args: any[]) {
		clearTimeout(timer);
		timer = window.setTimeout(func.bind(this, ...args), delay);
	};
}

function throttle(func: (...args: any[]) => unknown, delay = 300) {
	let start = performance.now();

	return function (this: any, ...args: any[]) {
		if (performance.now() - start > delay) {
			start = performance.now();
			return func.call(this, ...args);
		}
	};
}

// https://underscorejs.org/docs/modules/throttle.html
function better_throttle(func: (...args: any[]) => unknown, wait = 300) {
	let timeout: number | undefined;
	let result: unknown;
	let previous = 0;
	let argsList: any[] | null = null;

	const throttled = function (this: any, ...args: any[]) {
		const _now = performance.now();
		const remaining = wait - (_now - previous);
		argsList = args;

		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = undefined;
			}
			previous = _now;
			result = func.call(this, ...argsList);
			if (!timeout) argsList = null;
		} else if (!timeout) {
			timeout = setTimeout(() => {
				previous = performance.now();
				timeout = undefined;
				result = func.call(this, ...argsList);
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

export { debounce, throttle, better_throttle };
