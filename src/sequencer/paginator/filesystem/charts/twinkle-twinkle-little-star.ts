import { Chart, EventType, MillisecondsIntoSong, PitchNumber } from '../../../../types.ts'
import { Beats, BeatsIntoSong, Bpm, computeScheduleAheadTime, convertBpmToMpb, convertSpecificPitchToMidiNumber, Dynamics, SpecificPitch, tastefullyShortenDuration } from './scripts/helper.ts'

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
    compose: function* ({ lead }) {
        // Do this every time you compose
        const octaveJumpControl = lead.controller.getRangeControl('8va chance: ', 0, 100, '%')

        for (const [pitchNumber, startTime, endTime] of fastNotes) {
            yield {
                time: startTime - computeScheduleAheadTime,
                type: EventType.Compute,
            }

            const shouldJump = octaveJumpControl.value > (Math.random() * 100)
            const pitch = shouldJump ? pitchNumber + 12 : pitchNumber

            yield {
                time: startTime,
                type: EventType.NoteOn,
                part: lead,
                pitch,
                velocity,
            }

            yield {
                time: endTime,
                type: EventType.NoteOff,
                part: lead,
                pitch,
            }
        }
    },
}

export default chart