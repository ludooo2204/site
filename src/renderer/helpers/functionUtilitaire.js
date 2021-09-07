export function determinationCoefficient(data, results) {
	const predictions = [];
	const observations = [];

	data.forEach((d, i) => {
		if (d[1] !== null) {
			observations.push(d);
			predictions.push(results[i]);
		}
	});

	const sum = observations.reduce((a, observation) => a + observation[1], 0);
	const mean = sum / observations.length;

	const ssyy = observations.reduce((a, observation) => {
		const difference = observation[1] - mean;
		return a + difference * difference;
	}, 0);

	const sse = observations.reduce((accum, observation, index) => {
		const prediction = predictions[index];
		const residual = observation[1] - prediction[1];
		return accum + residual * residual;
	}, 0);

	return 1 - sse / ssyy;
}

export const regressionExponential=(data, options)=> {
	const sum = [0, 0, 0, 0, 0, 0];

	for (let n = 0; n < data.length; n++) {
		if (data[n][1] !== null) {
			sum[0] += data[n][0];
			sum[1] += data[n][1];
			sum[2] += data[n][0] * data[n][0] * data[n][1];
			sum[3] += data[n][1] * Math.log(data[n][1]);
			sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]);
			sum[5] += data[n][0] * data[n][1];
		}
	}

	const denominator = sum[1] * sum[2] - sum[5] * sum[5];
	const a = Math.exp((sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
	const b = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;
	const coeffA = Math.round(a, options.precision);
	const coeffB = Math.round(b, options.precision);
	const predict = (x) => [Math.round(x, options.precision), Math.round(coeffA * Math.exp(coeffB * x), options.precision)];

	const points = data.map((point) => predict(point[0]));

	return {
		points,
		predict,
		equation: [coeffA, coeffB],
		string: `y = ${coeffA}e^(${coeffB}x)`,
		r2: Math.round(determinationCoefficient(data, points), options.precision),
	};
}


export function comparer(a, b) {
	const dateA = new Date(a.dateEtalonnage);
	const dateB = new Date(b.dateEtalonnage);

	let comparaison = 0;
	if (dateA > dateB) {
		comparaison = 1;
	} else if (dateA < dateB) {
		comparaison = -1;
	}
	return comparaison;
}

export function interpoler(x, points, wrapAround) {
	// Make sure all points are in order
	points = points.sort((a, b) => {
		if (a[0] > b[0]) return 1;
		if (a[0] < b[0]) return -1;
		return 0;
	});

	// Find the right interval
	let i1, i2;
	for (i2 = 0; i2 < points.length; i2++) if (points[i2][0] >= x) break;
	if (i2 === points.length) {
		// We hit the upper bound
		if (wrapAround) {
			i2 = 0;
			i1 = points.length - 1;
		} else {
			i2 = i2 - 1;
			i1 = i2;
		}
	} else if (i2 === 0) {
		// We hit the lower bound
		if (wrapAround) {
			i2 = 0;
			i1 = points.length - 1;
		} else {
			i1 = i2;
		}
	} else {
		i1 = i2 - 1;
	}

	// Same points -> Return y
	if (i1 === i2) return points[i1][1];

	// Interpolate value
	let [x1, y1] = points[i1];
	let [x2, y2] = points[i2];
	// We wrapped around the clock
	if (i1 >= i2) {
		if (x >= x1) x2 += wrapAround;
		else x1 -= wrapAround;
	}
	const m = (y2 - y1) / (x2 - x1);
	const b = (x2 * y1 - x1 * y2) / (x2 - x1);

	return m * x + b;
}
