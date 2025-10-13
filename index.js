const express = require('express');
const path = require('path');
const pino = require('pino');
const fs = require('fs');
const fsAsync = require('fs/promises');
const { Worker } = require('worker_threads');

const app = express();
const logger = pino({ level: 'info' });
const PORT = 3000;
let t = null;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/view/products', (req, res) => {
	const { products } = require('./dummy-products.json');
	res.render('products', { products });
});

/**
 * @description: Get Hello World
 */
app.get('/', (req, res) => {
	res.send('Hello World');
});

/**
 * Logger with console
 * Syncronous logging
 */
app.get('/logger/console', (req, res) => {
	console.log(`Hello World! ${req.url}`);
	res.send('Hello World');
});

/**
 * Logger with pino
 * Asyncronous logging
 */
app.get('/logger/pino', (req, res) => {
	logger.info(`Hello World! ${req.url}`);
	res.send('Hello World');
});

/**
 * @description: Read file syncronously through fs
 */
app.get('/readfile/sync', (req, res) => {
	try {
		const data = fs.readFileSync('./dummy-texts-over-100mb.txt', 'utf8');

		// Old callback method
		// fs.readFile('./dummy-texts-over-100mb.txt', 'utf8', (err, data) => {
		//     if (err) {
		//         logger.error('Error reading file:', err);
		//         res.status(500).send('Error reading file');
		//     } else {
		//         res.send(data);
		//     }
		// });

		res.send(data);
	} catch (error) {
		logger.error('Error reading file synchronously:', error);
		res.status(500).send('Error reading file');
	}
});

/**
 * @description: Read file asyncronously through fs
 */
app.get('/readfile/async', async (req, res) => {
	try {
		const data = await fsAsync.readFile('./dummy-texts-over-100mb.txt', 'utf8');
		res.send(data);
	} catch (error) {
		logger.error('Error reading file asynchronously:', error);
		res.status(500).send('Error reading file');
	}
});

/**
 * @description: Blocking event loop
 */
app.get('/event-loop/blocking', async (req, res) => {
	let sum = 0;
	for (let i = 0; i < 1e9; i++) {
		sum += i;
	}

	res.send(`Execution completed. Sum: ${sum}`);
});

/**
 * @description: Non-blocking event loop
 */
const runWorker = () => {
	return new Promise((resolve, reject) => {
		const worker = new Worker('./worker.js');

		worker.on('message', resolve);
		worker.on('error', reject);
		worker.on('exit', (code) => {
			if (code !== 0) {
				reject(new Error(`Worker stopped with exit code ${code}`));
			}
		});
	});
};
app.get('/event-loop/non-blocking', async (req, res) => {
	const sum = await runWorker();
	res.send(`Execution completed. Sum: ${sum}`);
});

app.get('/timeout/none', async (req, res) => {
	await fetch(`http://localhost:${PORT}/api/products`, {
		headers: { 'Content-Type': 'application/json' }
	}).then(async (response) => {
		console.log('Response:', response);
		const data = await response.json();
		res.json(data);
	}).catch((error) => {
		logger.error('Error fetching data:', error);
		res.status(500).send('Error fetching data');
	});
});

app.get('/timeout/used', async (req, res) => {
	const controller = new AbortController();
	t = setTimeout(() => {
		controller.abort();
	}, 3000);

	await fetch(`http://localhost:${PORT}/api/products`, {
		headers: { 'Content-Type': 'application/json' },
		signal: controller.signal
	}).then(async (response) => {
		console.log('Response:', response);
		const data = await response.json();
		res.json(data);
	}).catch((error) => {
		logger.error('Error fetching data:', error);
		res.status(500).send('Error fetching data');
	}).finally(() => {
		clearTimeout(t);
	});
});

app.get('/cluster/without', async (req, res) => {
	let number = 0;
	const start = Date.now();
	for (let i = 0; i <= 999999; i++) {
		number += 1;
	}

	res.json([{ status: true, number, processTime: Date.now() - start }]);
});

app.get('/api/products', async (req, res) => {
	// Simulate a delay of 5 seconds
	await new Promise((resolve) => setTimeout(resolve, 5000));
	res.json([{ id: 1, name: 'Product 1' }]);
});

app.get('/emitter', (req, res) => {
	const EventEmitter = require('events');
	const myEmitter = new EventEmitter();
	myEmitter.on('event', () => {
		console.log('an event occurred!');
	});
	myEmitter.emit('event');
	res.send('Event emitted, check console');
});

/**
 * @description: Server is running on port ${PORT}
*/
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});