import Playbacker from '../../playbacker/playbacker.ts'
import { PartsConfig, Chart, BufferEvent, BufferEventType } from '../../../types.ts'
import { makeParts } from './part/part.ts'
import dm from '../../../dm.ts'

const windowLength = 100

//#region makeWorker
export const enum WorkerMessageType {  // THIS ALSO HAS TO BE IN WORKER.TS
    Start,
    Stop,
    Tick,
}

export const workerTickRate = 25  // THIS ALSO HAS TO BE IN WORKER.TS

function makeWorker(): Worker {
    return new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
}
//#endregion

//#region Band
export default class Band {
    #playbacker: Playbacker
    #worker = makeWorker()
    #parts
    #playing = false
    #buffer: BufferEvent[] = []
    #loadBuffer: () => void = () => { }
    #startTime = 0
    #durationIntoSong = 0

    constructor(playbacker: Playbacker, config: PartsConfig) {
        this.#playbacker = playbacker
        this.#parts = makeParts(config)
        this.#worker.onmessage = (_) => this.schedule()
    }

    schedule() {
        const endOfWindow = window.performance.now() + windowLength

        while (this.#playing && this.#nextEventTime < endOfWindow) {
            const eventTime = this.#nextEventTime
            const event = this.#buffer.shift()

            if (event) {
                switch (event.type) {
                    case BufferEventType.NoteOn:
                        event.part.synthesizer.noteOn(event.pitch, event.velocity, eventTime)
                        break
                    case BufferEventType.NoteOff:
                        event.part.synthesizer.noteOff(event.pitch, eventTime)
                        break
                    case BufferEventType.Compute:
                        event.callback(this.#buffer)
                        break
                }

            }
        }
    }

    get #nextEventTime(): number {
        if (this.#buffer.length === 0) {
            this.#playbacker.stop()
            return Infinity
        }

        return this.#buffer[0].time + this.#startTime
    }

    changeChart(chart: Chart): void {
        (this.#loadBuffer = () => {

            for (const part of Object.values(this.#parts)) {
                part.controller.clear()
            }

            // this.#buffer = chart.compose(this.#parts)
            console.debug('buffer', this.#buffer = chart.compose(this.#parts))
        })()
    }

    play(): void {
        this.#playing = true

        this.#startTime = window.performance.now() + windowLength
        this.#durationIntoSong = 0

        this.#worker.postMessage(WorkerMessageType.Start)
    }

    pause(): void {
        this.#playing = false

        this.#worker.postMessage(WorkerMessageType.Stop)

        this.#durationIntoSong = window.performance.now() - this.#startTime

        const pauseAll = () => {
            for (const part of Object.values(this.#parts)) {
                part.synthesizer.pause()
            }
        }

        setTimeout(pauseAll, windowLength * 2)
    }

    resume(): void {
        this.#playing = true

        this.#startTime = window.performance.now() - this.#durationIntoSong

        this.#worker.postMessage(WorkerMessageType.Start)

        for (const part of Object.values(this.#parts)) {
            part.synthesizer.resume()
        }
    }

    stop(): void {
        this.#playing = false

        this.#worker.postMessage(WorkerMessageType.Stop)

        this.#durationIntoSong = 0
        this.#loadBuffer()

        const allNotesOff = () => {
            for (const part of Object.values(this.#parts)) {
                part.synthesizer.allNotesOff()
            }
        }

        setTimeout(allNotesOff, windowLength * 2)
    }

    render(): HTMLDivElement | null {
        const partDivs = Object.values(this.#parts).map(part => part.render())

        return partDivs.some(div => div !== null) ? dm('div', { id: 'part-container' }, ...partDivs) as HTMLDivElement : null
    }
}
//#endregion