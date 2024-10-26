import { Beats, BeatsIntoSong, Bpm, convertBpmToMpb, SpecificPitch, tastefullyShortenDuration, convertSpecificPitchToMidiNumber, computeScheduleAheadTime, Dynamics } from '../helper.ts'
import { BufferEvent, Chart, PitchNumber, MillisecondsIntoSong, BufferEventType, BufferNoteOnEvent, BufferNoteOffEvent } from '../../../../types.ts'

// The easy to work with information for the song
const tempo: Bpm = 120
type EasyNote = [SpecificPitch, BeatsIntoSong, Beats]
const easyNotes: EasyNote[] = [
    ['C4', 0, 0.9],
    ['C4', 1, 0.9],
    ['G4', 2, 0.9],
    ['G4', 3, 0.9],
    ['A4', 4, 0.9],
    ['A4', 5, 0.9],
    ['G4', 6, 1.9],
    ['F4', 8, 0.9],
    ['F4', 9, 0.9],
    ['E4', 10, 0.9],
    ['E4', 11, 0.9],
    ['D4', 12, 0.9],
    ['D4', 13, 0.9],
    ['C4', 14, 1.9],
    ['G4', 16, 0.9],
    ['G4', 17, 0.9],
    ['F4', 18, 0.9],
    ['F4', 19, 0.9],
    ['E4', 20, 0.9],
    ['E4', 21, 0.9],
    ['D4', 22, 1.9],
    ['G4', 24, 0.9],
    ['G4', 25, 0.9],
    ['F4', 26, 0.9],
    ['F4', 27, 0.9],
    ['E4', 28, 0.9],
    ['E4', 29, 0.9],
    ['D4', 30, 1.9],
    ['C4', 32, 0.9],
    ['C4', 33, 0.9],
    ['G4', 34, 0.9],
    ['G4', 35, 0.9],
    ['A4', 36, 0.9],
    ['A4', 37, 0.9],
    ['G4', 38, 1.9],
    ['F4', 40, 0.9],
    ['F4', 41, 0.9],
    ['E4', 42, 0.9],
    ['E4', 43, 0.9],
    ['D4', 44, 0.9],
    ['D4', 45, 0.9],
    ['C4', 46, 2],
]
const velocity = Dynamics.mf

// We can process this upfront because it is a constant
const mpb = convertBpmToMpb(tempo)
type FastNote = [PitchNumber, MillisecondsIntoSong, MillisecondsIntoSong]
const fastNotes = easyNotes.map(([specificPitch, beatsIntoSong, beatDuration]): FastNote => {
    const pitchNumber = convertSpecificPitchToMidiNumber(specificPitch)
    const startTime = beatsIntoSong * mpb
    const endTime = (beatsIntoSong + tastefullyShortenDuration(beatDuration)) * mpb

    return [pitchNumber, startTime, endTime]
})

const chart: Chart = {
    title: 'Twinkle Twinkle Little Star',
    compose: ({ lead }): BufferEvent[] => {
        // Do this every time you compose
        const octaveJumpControl = lead.controller.getRangeControl('8va chance: ', 0, 100, '%')

        // Converts the fast to work with information to the compute buffer events
        return fastNotes.map(([pitchNumber, startTime, endTime]): BufferEvent => {
            return {
                time: startTime - computeScheduleAheadTime,
                type: BufferEventType.Compute,
                callback: (buffer: BufferEvent[]): void => {
                    const shouldJump = octaveJumpControl.value > (Math.random() * 100)
                    const pitch = shouldJump ? pitchNumber + 12 : pitchNumber

                    const noteOnEvent: BufferNoteOnEvent = {
                        time: startTime,
                        type: BufferEventType.NoteOn,
                        part: lead,
                        pitch,
                        velocity,
                    }

                    const noteOffEvent: BufferNoteOffEvent = {
                        time: endTime,
                        type: BufferEventType.NoteOff,
                        part: lead,
                        pitch,
                    }

                    buffer.unshift(noteOnEvent, noteOffEvent)
                }
            }
        })
    },
}

export default chart