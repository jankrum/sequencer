import { Event, EventType, Milliseconds, MillisecondsIntoSong, PitchNumber } from "../../../../../types"
import Part from "../../../../playbacker/band/part/part"
import { Beats, Bpm, computeBeatTiming, convertBpmToMpb, convertSpecificPitchToMidiNumber, Dynamics, Note, SwingAmount, tastefullyShortenDuration } from "./helper"

type FastNote = [pitch: PitchNumber, velocity: Dynamics, startTime: MillisecondsIntoSong, endTime: MillisecondsIntoSong]

export function convertEasyToFast(tempo: Bpm, swingAmount: SwingAmount, swingDivision: Beats, easyNotes: Note[], velocity: Dynamics): FastNote[] {
    const mpb: Milliseconds = convertBpmToMpb(tempo)

    return easyNotes.map(([specificPitch, position, duration]: Note) => {
        const pitch = convertSpecificPitchToMidiNumber(specificPitch)
        const startTime = computeBeatTiming(position, mpb, swingAmount, swingDivision)
        const endTime = computeBeatTiming(position + tastefullyShortenDuration(duration), mpb, swingAmount, swingDivision)

        return [pitch, velocity, startTime, endTime]
    })
}

export default function* dummyPlayer(part: Part, notes: FastNote[]): Generator<Event> {
    for (const [pitch, velocity, startTime, endTime] of notes) {
        yield {
            type: EventType.NoteOn,
            time: startTime,
            part,
            pitch,
            velocity,
        }

        yield {
            type: EventType.NoteOff,
            time: endTime,
            part,
            pitch,
        }
    }
}