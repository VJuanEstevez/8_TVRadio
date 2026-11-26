import { registerServiceWorker } from './modules/service-worker.js';
import { initInstall } from './modules/install.js';
import { init } from './modules/app.js';

registerServiceWorker();
initInstall();
init();
