import { Event, EventType, Milliseconds } from "../../../../../types"
import Part from "../../../../playbacker/band/part/part"
import { Beats, Bpm, computeBeatTiming, convertBpmToMpb, convertSpecificPitchToMidiNumber, Dynamics, SwingAmount, triggerLength } from "./helper"

export default function* jazzDrummer(drum: Part, tempo: Bpm, swingAmount: SwingAmount, swingDivision: Beats, length: Beats, velocity: Dynamics): Generator<Event> {
    const mpb: Milliseconds = convertBpmToMpb(tempo)

    const closedHiHat = convertSpecificPitchToMidiNumber('D3')
    const openHiHat = convertSpecificPitchToMidiNumber('D#3')

    for (let i = 0; i < length; i += 1) {
        const firstTime = computeBeatTiming(i, mpb, swingAmount, swingDivision)
        const secondTime = computeBeatTiming(i + 0.5, mpb, swingAmount, swingDivision)

        const firstSample = i % 2 === 0 ? closedHiHat : openHiHat

        yield {
            type: EventType.NoteOn,
            time: firstTime,
            part: drum,
            pitch: firstSample,
            velocity,
        }

        yield {
            type: EventType.NoteOff,
            time: firstTime + triggerLength,
            part: drum,
            pitch: firstSample,
        }

        yield {
            type: EventType.NoteOn,
            time: secondTime,
            part: drum,
            pitch: closedHiHat,
            velocity,
        }

        yield {
            type: EventType.NoteOff,
            time: secondTime + triggerLength,
            part: drum,
            pitch: closedHiHat,
        }
    }
}