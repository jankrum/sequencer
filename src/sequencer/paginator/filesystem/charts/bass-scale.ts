import { Chart, BufferEvent, BufferNoteOnEvent, BufferEventType, BufferNoteOffEvent, PitchNumber, MillisecondsIntoSong, } from '../../../../types.ts'
import { SpecificPitch, convertBpmToMpb, convertSpecificPitchToMidiNumber, tastefullyShortenDuration, Bpm, Dynamics, Beats, } from '../helper.ts'

// Easy to work with
const tempo: Bpm = 120
const majorScale: SpecificPitch[] = ['C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C3']
const velocity: Dynamics = Dynamics.mf
const lastNoteDuration: Beats = 2

// Fast to work with
const mpb = convertBpmToMpb(tempo)
type FastNote = [PitchNumber, MillisecondsIntoSong, MillisecondsIntoSong]
const fastMajorScale: FastNote[] = majorScale.map((specificPitch, index) => {
    const pitchNumber = convertSpecificPitchToMidiNumber(specificPitch)
    const startTime = index * mpb
    const isLastNote = index === majorScale.length - 1
    const duration = isLastNote ? lastNoteDuration : 1
    const endTime = (index + tastefullyShortenDuration(duration)) * mpb

    return [pitchNumber, startTime, endTime]
})

// Chart
const chart: Chart = {
    title: 'Bass Scale',
    compose: ({ bass }): BufferEvent[] => fastMajorScale.map(([pitch, startTime, endTime]): [BufferNoteOnEvent, BufferNoteOffEvent] => ([{
        time: startTime,
        type: BufferEventType.NoteOn,
        part: bass,
        pitch,
        velocity,
    },
    {
        time: endTime,
        type: BufferEventType.NoteOff,
        part: bass,
        pitch,
    }])).flat(),

}

export default chart