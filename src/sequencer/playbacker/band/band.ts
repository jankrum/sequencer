import Playbacker from '../../playbacker/playbacker.ts'
import { PartsConfig, Chart, BufferEvent, BufferEventType } from '../../../types.ts'
import Part, { makeParts } from './part/part.ts'
import dm from '../../../dm.ts'

const windowLength = 100

//#region makeWorker
export const enum WorkerMessageType {
    Start,
    Stop,
    Tick,
}

export const workerTickRate = 25

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
    #millisecondsPerBeat = 60000 / 120
    #partsThatAreFinished = new Set<Part>()

    constructor(playbacker: Playbacker, config: PartsConfig) {
        this.#playbacker = playbacker
        this.#parts = makeParts(config)
        this.#worker.onmessage = (_) => this.schedule()
    }

    schedule() {
        const endOfWindow = (window.performance.now() - this.#startTime) + windowLength

        while (this.#playing && this.#nextEventTime < endOfWindow) {
            const event = this.#buffer.shift()

            if (event) {
                switch (event.type) {
                    case BufferEventType.Tempo:
                        this.#millisecondsPerBeat = 60000 / event.bpm
                        break
                    case BufferEventType.Finish:
                        this.#partsThatAreFinished.add(event.part)
                        if (this.#partsThatAreFinished.size === 4) {
                            // Will propagate back to the band
                            this.#playbacker.stop()
                        }
                        break
                    case BufferEventType.NoteOn:
                        event.part.synthesizer.noteOn(event.pitch, this.#nextEventTime)
                        break
                    case BufferEventType.NoteOff:
                        event.part.synthesizer.noteOff(event.pitch, this.#nextEventTime)
                        break
                }

            }
        }
    }

    get #nextEventTime(): number {
        if (this.#buffer.length === 0) {
            return Infinity
        }

        return this.#buffer[0].position * this.#millisecondsPerBeat
    }

    changeChart(chart: Chart): void {
        (this.#loadBuffer = () => {

            for (const part of Object.values(this.#parts)) {
                part.controller.clear()
            }

            this.#buffer = chart.compose(this.#parts)
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
    }

    resume(): void {
        this.#playing = true

        this.#startTime = window.performance.now() - this.#durationIntoSong

        this.#worker.postMessage(WorkerMessageType.Start)
    }

    stop(): void {
        this.#playing = false

        this.#worker.postMessage(WorkerMessageType.Stop)

        this.#durationIntoSong = 0
        this.#partsThatAreFinished.clear()
        this.#loadBuffer()

        const allNotesOff = () => {
            for (const part of Object.values(this.#parts)) {
                part.synthesizer.allNotesOff()
            }
        }

        setTimeout(allNotesOff, windowLength)
    }

    render(): HTMLDivElement | null {
        const partDivs = Object.values(this.#parts).map(part => part.render())

        return partDivs.some(div => div !== null) ? dm('div', { id: 'part-container' }, ...partDivs) as HTMLDivElement : null
    }
}
//#endregion