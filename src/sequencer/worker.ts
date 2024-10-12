import { WorkerMessageType, workerTickRate } from './band.ts'

let intervalHandle: number

self.onmessage = (e: { data: WorkerMessageType }): void => {
    if (e.data === WorkerMessageType.Start) {
        if (intervalHandle) {
            clearInterval(intervalHandle)
        }
        intervalHandle = setInterval(() => postMessage(WorkerMessageType.Tick), workerTickRate)
    } else if (e.data === WorkerMessageType.Stop) {
        clearInterval(intervalHandle)
    }
}