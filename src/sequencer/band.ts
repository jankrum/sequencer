import { Playbacker } from './sequencer.ts'
import Chart, { PartName, BufferEvent, BufferEventType } from '../types.ts'

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

//#region makeParts
// class Controller { }

class Synthesizer {
    #name: PartName

    constructor(name: PartName) {
        this.#name = name
    }

    noteOn(pitch: number, time: number) {
        console.log('noteOn', this.#name, pitch, time)
    }

    noteOff(pitch: number, time: number) {
        console.log('noteOff', this.#name, pitch, time)
    }

    allNotesOff() {
        console.log('allNotesOff', this.#name)
    }
}

export class Part {
    synthesizer: Synthesizer

    constructor(name: PartName) {
        this.synthesizer = new Synthesizer(name)
    }
}

function makeParts() {
    return {
        bass: new Part('bass'),
        drum: new Part('drum'),
        chord: new Part('chord'),
        lead: new Part('lead'),
    }
}
//#endregion

//#region Band
export default class Band {
    #playbacker: Playbacker
    #worker = makeWorker()
    #parts = makeParts()
    #playing = false
    #buffer: BufferEvent[] = []
    #loadBuffer: () => void = () => { }
    #startTime = 0
    #durationIntoSong = 0
    #millisecondsPerBeat = 60000 / 120
    #partsThatAreFinished = new Set<Part>()

    constructor(playbacker: Playbacker) {
        this.#playbacker = playbacker

        this.#worker.onmessage = (e: { data: WorkerMessageType }) => {
            if (this.#playing) {
                if (e.data === WorkerMessageType.Tick) {
                    this.schedule()
                }
            }
        }
    }

    schedule() {
        const endOfWindow = (window.performance.now() - this.#startTime) + 100

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
        (this.#loadBuffer = () => this.#buffer = chart.compose(this.#parts))()
    }

    play(): void {
        this.#playing = true

        this.#startTime = window.performance.now() + 100
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

        for (const part of Object.values(this.#parts)) {
            part.synthesizer.allNotesOff()
        }
    }
}
//#endregion