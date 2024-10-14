// import { WorkerMessageType, workerTickRate } from './band.ts'

const enum WorkerMessageType {  // THIS HAS TO BE THE SAME AS THE ONE IN BAND.TS
    Start,
    Stop,
    Tick,
}

const workerTickRate = 25  // THIS HAS TO BE THE SAME AS THE ONE IN BAND.TS

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