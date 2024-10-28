import { Chart, EventType, MillisecondsIntoSong, PitchNumber } from '../../../../types.ts'
import { Beats, Bpm, Dynamics, SpecificPitch, convertBpmToMpb, convertSpecificPitchToMidiNumber, tastefullyShortenDuration, } from '../helper.ts'

// Easy to work with
const tempo: Bpm = 120
const majorScale: SpecificPitch[] = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3']
const velocity: Dynamics = Dynamics.mf
const lastNoteDuration: Beats = 2

// Fast to work with
const mpb = convertBpmToMpb(tempo)
const pitchNumbers: PitchNumber[] = majorScale.map(convertSpecificPitchToMidiNumber)

// Chart
const chart: Chart = {
    title: 'Bass Scale',
    compose: function* ({ bass }) {
        for (const [index, pitchNumber] of pitchNumbers.entries()) {
            const startTime: MillisecondsIntoSong = index * mpb
            const isLastNote = index === majorScale.length - 1
            const duration = isLastNote ? lastNoteDuration : 1
            const endTime = (index + tastefullyShortenDuration(duration)) * mpb

            yield {
                time: startTime,
                type: EventType.NoteOn,
                part: bass,
                pitch: pitchNumber,
                velocity,
            }

            yield {
                time: endTime,
                type: EventType.NoteOff,
                part: bass,
                pitch: pitchNumber,
            }
        }
    },
}

export default chart