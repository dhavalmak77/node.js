import { availableParallelism } from 'node:os';

const numCPUs = availableParallelism();

console.log(numCPUs);