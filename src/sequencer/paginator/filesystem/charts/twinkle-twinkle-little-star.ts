import { Chart, BufferEvent, BufferEventType, BufferComputeEvent, BufferNoteOnEvent, BufferNoteOffEvent, BufferFinishEvent } from '../../../../types.ts'
import Part from '../../../playbacker/band/part/part.ts'
import { setInitialTempo, sitOut } from '../helper.ts'

// type Note = [pitch: number, duration: number, position: number]
// const songNotes: Note[] = (() => {
//     const aSection: Note[] = [
//         [0, 1, 0],
//         [0, 1, 0],
//         [7, 1, 0],
//         [7, 1, 0],
//         [9, 1, 0],
//         [9, 1, 0],
//         [7, 2, 0],
//         [5, 1, 0],
//         [5, 1, 0],
//         [4, 1, 0],
//         [4, 1, 0],
//         [2, 1, 0],
//         [2, 1, 0],
//         [0, 2, 0],
//     ] as const

//     const bSection: Note[] = [
//         [7, 1, 0],
//         [7, 1, 0],
//         [5, 1, 0],
//         [5, 1, 0],
//         [4, 1, 0],
//         [4, 1, 0],
//         [2, 2, 0],
//     ] as const

//     const sections: Note[] = [...aSection, ...bSection, ...bSection, ...aSection,]

//     let acc = 0

//     const song: Note[] = []

//     for (const note of sections) {
//         song.push([note[0] + 48, note[1], acc])
//         acc += note[1]
//     }

//     return song
// })()

// function makeOctaveJump(part: Part, [pitch, duration, position]: Note): BufferComputeEvent {
//     const computePosition = position - 0.1

//     return {
//         position: computePosition,
//         type: BufferEventType.Compute,
//         callback: (buffer: BufferEvent[]) => {
//             buffer.push({
//                 position: computePosition,
//                 part,
//                 type: BufferEventType.NoteOff,
//                 pitch: pitch - 12,
//             })
//         }
//     }
// }

// function makeEventsFromSong(part: Part, song: Note[]): BufferEvent[] {
//     return [
//         ...song.map(([pitch, duration, position]): [BufferNoteOnEvent, BufferNoteOffEvent] => ([
//             {
//                 position,
//                 part,
//                 type: BufferEventType.NoteOn,
//                 pitch,
//             },
//             {
//                 position: position + duration - 0.1,
//                 part,
//                 type: BufferEventType.NoteOff,
//                 pitch,
//             }
//         ])).flat(),
//         {
//             position: (song.at(-1) ?? [0, 0, 0])[2] + 0.1,
//             type: BufferEventType.Finish,
//             part
//         }
//     ]
// }

type Note = [number, number, number]

const pitchesPositionsAndDurations: Note[] = [
    [60, 0, 1],
    [60, 1, 1],
    [67, 2, 1],
    [67, 3, 1],
    [69, 4, 1],
    [69, 5, 1],
    [67, 6, 2],
    [65, 8, 1],
    [65, 9, 1],
    [64, 10, 1],
    [64, 11, 1],
    [62, 12, 1],
    [62, 13, 1],
    [60, 14, 2],
]

function playTTLS(part: Part): BufferEvent[] {
    const octaveJumpControl = part.controller.getRangeControl('8va chance: ', 0, 100, '%')

    function makeJumpEvent([pitch, position, duration]: Note): BufferComputeEvent {
        const roll = Math.random() * 100

        return {
            position: position - 0.1,
            type: BufferEventType.Compute,
            callback: (buffer: BufferEvent[]) => {
                const chance = octaveJumpControl.value

                const newPitch = roll < chance ? pitch + 12 : pitch

                const noteOnEvent = {
                    position,
                    type: BufferEventType.NoteOn,
                    part,
                    pitch: newPitch,
                } as BufferNoteOnEvent

                const noteOffEvent = {
                    position: position + duration - 0.1,
                    type: BufferEventType.NoteOff,
                    part,
                    pitch: newPitch,
                } as BufferNoteOffEvent

                buffer.unshift(noteOnEvent, noteOffEvent)
            }
        }
    }

    const computeEvents = pitchesPositionsAndDurations.map(makeJumpEvent)

    const [_, lastPosition, lastDuration] = pitchesPositionsAndDurations.at(-1) ?? [0, 0, 0]

    const finishEvent: BufferFinishEvent = {
        position: lastDuration + lastPosition + 0.1,
        type: BufferEventType.Finish,
        part,
    }

    return [
        ...computeEvents,
        finishEvent,
    ]
}

const chart: Chart = {
    title: "Twinkle Twinkle Little Star",
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => [
        setInitialTempo(120),
        ...sitOut(bass, drum, keys),
        ...playTTLS(lead),
    ],
}

export default chart