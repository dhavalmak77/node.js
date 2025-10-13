const express = require('express');
const cluster = require('node:cluster');
const process = require('node:process');
const pino = require('pino');
const numCPUs = require('node:os').availableParallelism();
const app = express();
const logger = pino({ level: 'info' });
const PORT = 4000;

if (cluster.isPrimary) {
	console.log(`Primary ${process.pid} is running`);

	// Fork workers.
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	// cluster.on('exit', (worker, code, signal) => {
	// 	console.log(`worker ${worker.process.pid} died`);
	// });
} else {
	app.get('/', (req, res) => {
		let number = 0;
		const start = Date.now();
		for (let i = 0; i <= 999999; i++) {
			number += 1;
		}

		logger.info(`Process: ${process.pid}`);

		res.json([{ status: true, number, processTime: Date.now() - start }]);
	});

	app.listen(PORT, () => {
		console.log(`Server listening at http://localhost:${PORT}`);
	});
}