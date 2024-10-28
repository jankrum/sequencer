import dm from '../../../dm.ts'
import { Chart, Event, EventType, Milliseconds, PartsConfig } from '../../../types.ts'
import Playbacker from '../../playbacker/playbacker.ts'
import { makeParts } from './part/part.ts'

// How far before the event should we schedule it
export const windowLength = 100

//#region Band
export default class Band {
    #playbacker: Playbacker
    #parts
    #partsArray
    #schedulerTimeout: number = 0
    #load: () => void = () => { }
    #eventGenerator: Generator<Event> = (function* () { })()
    #startTime = 0
    #durationIntoSong = 0
    #nextEvent: Event | null = null

    constructor(playbacker: Playbacker, config: PartsConfig) {
        this.#playbacker = playbacker
        this.#parts = makeParts(config)
        this.#partsArray = Object.values(this.#parts)
    }

    changeChart(chart: Chart): void {
        const load = this.#load = () => {
            for (const part of this.#partsArray) {
                part.controller.clear()
            }

            this.#eventGenerator = chart.compose(this.#parts)

            this.#nextEvent = this.#eventGenerator.next().value
        }

        load()
    }

    #schedule(): void {
        const nextEvent = this.#nextEvent
        if (nextEvent === null) {
            console.error('nextEvent is null')
            this.#playbacker.stop()
            return
        }

        const nextEventTimeInChart = nextEvent.time
        const nextEventTime = nextEventTimeInChart + this.#startTime
        const timeUntilNextEvent: Milliseconds = nextEventTime - window.performance.now() - windowLength

        // In "n" milliseconds, deal with the event and maybe schedule the next one
        this.#schedulerTimeout = setTimeout(() => {
            // Handle the next event
            switch (nextEvent.type) {
                case EventType.Compute:
                    break
                case EventType.NoteOn:
                    nextEvent.part.synthesizer.noteOn(nextEvent.pitch, nextEvent.velocity, nextEventTime)
                    break
                case EventType.NoteOff:
                    nextEvent.part.synthesizer.noteOff(nextEvent.pitch, nextEventTime)
                    break
            }

            const nextEventResult: IteratorResult<Event> = this.#eventGenerator.next()

            // If there are no more events, stop the playback
            if (nextEventResult.done) {
                // This is the kosher way to stop the playback
                this.#playbacker.stop()
                return
            }

            this.#nextEvent = nextEventResult.value
            this.#schedule()
        }, timeUntilNextEvent)
    }

    play(): void {
        this.#startTime = window.performance.now() + windowLength
        this.#durationIntoSong = 0
        this.#schedule()
    }

    pause(): void {
        clearTimeout(this.#schedulerTimeout)
        this.#durationIntoSong = window.performance.now() - this.#startTime

        for (const part of this.#partsArray) {
            part.synthesizer.pause()
        }
    }

    resume(): void {
        this.#startTime = window.performance.now() - this.#durationIntoSong

        for (const part of this.#partsArray) {
            part.synthesizer.resume()
        }

        this.#schedule()
    }

    stop(): void {
        clearTimeout(this.#schedulerTimeout)
        this.#durationIntoSong = 0
        this.#load()

        for (const part of this.#partsArray) {
            part.synthesizer.allNotesOff()
        }
    }

    render(): HTMLDivElement | null {
        const partDivs = this.#partsArray.map(part => part.render())

        const atLeastOnePartDiv = partDivs.some(div => div !== null)

        if (!atLeastOnePartDiv) {
            return null
        }

        const div = dm('div', { id: 'part-container' }, ...partDivs) as HTMLDivElement

        return div
    }
}
//#endregion