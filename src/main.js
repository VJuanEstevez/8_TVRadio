import { clearObsoleteServiceWorkers } from './modules/service-worker.js';
import { init } from './modules/app.js';

clearObsoleteServiceWorkers();
init();
