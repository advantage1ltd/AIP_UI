import { SetupWorker } from 'msw/browser'
 
export declare const worker: SetupWorker
export declare const initMockServiceWorker: () => Promise<void>
export declare const restartMockServiceWorker: () => Promise<void> 