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

export { debounce, throttle };
