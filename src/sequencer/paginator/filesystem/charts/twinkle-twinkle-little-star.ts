import { PipeOperation, SpecificPitch, Beats, BeatsIntoSong, convertSpecificPitchToMidiNumber, play, pipe, finish, setTempo, } from '../helper.ts'
import Part from '../../../playbacker/band/part/part.ts'
import { Chart, BufferEvent, } from '../../../../types.ts'

type Note = [SpecificPitch, BeatsIntoSong, Beats]

const pitchesPositionsAndDurations: Note[] = [
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

function playTTLS(lead: Part): PipeOperation[] {
    const octaveJumpControl = lead.controller.getRangeControl('8va chance: ', 0, 100, '%')

    return pitchesPositionsAndDurations.map(([pitchName, position, duration]) => {
        const roll = Math.random() * 100
        const midiPitch = convertSpecificPitchToMidiNumber(pitchName)
        const pitchFunction = (): number => octaveJumpControl.value > roll ? midiPitch + 12 : midiPitch

        return play(lead, pitchFunction, position, duration, 0x7F)
    })
}

const chart: Chart = {
    title: 'Twinkle Twinkle Little Star',
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => pipe(
        finish(bass, drum, keys),
        setTempo(120),
        ...playTTLS(lead),
        finish(lead),
    ),
}

export default chart