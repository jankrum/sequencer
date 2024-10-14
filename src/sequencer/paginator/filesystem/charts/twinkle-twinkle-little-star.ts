import { Chart, BufferEvent, BufferEventType, BufferNoteOnEvent, BufferNoteOffEvent } from '../../../../types.ts'
import Part from '../../../playbacker/band/part/part.ts'
import { setInitialTempo, sitOut } from '../helper.ts'

const chart: Chart = {
    title: "Twinkle Twinkle Little Star",
    compose: ({ bass, drum, keys, lead }): BufferEvent[] => {
        type Note = [pitch: number, duration: number, position: number]

        const songNotes: Note[] = (() => {
            const aSection: Note[] = [
                [0, 1, 0],
                [0, 1, 0],
                [7, 1, 0],
                [7, 1, 0],
                [9, 1, 0],
                [9, 1, 0],
                [7, 2, 0],
                [5, 1, 0],
                [5, 1, 0],
                [4, 1, 0],
                [4, 1, 0],
                [2, 1, 0],
                [2, 1, 0],
                [0, 2, 0],
            ] as const

            const bSection: Note[] = [
                [7, 1, 0],
                [7, 1, 0],
                [5, 1, 0],
                [5, 1, 0],
                [4, 1, 0],
                [4, 1, 0],
                [2, 2, 0],
            ] as const

            const sections: Note[] = [...aSection, ...bSection, ...bSection, ...aSection,]

            let acc = 0

            const song: Note[] = []

            for (const note of sections) {
                song.push([note[0] + 48, note[1], acc])
                acc += note[1]
            }

            return song
        })()

        function makeEventsFromSong(part: Part, song: Note[]): BufferEvent[] {
            return [
                ...song.map(([pitch, duration, position]): [BufferNoteOnEvent, BufferNoteOffEvent] => ([
                    {
                        position,
                        part,
                        type: BufferEventType.NoteOn,
                        pitch,
                    },
                    {
                        position: position + duration - 0.1,
                        part,
                        type: BufferEventType.NoteOff,
                        pitch,
                    }
                ])).flat(),
                {
                    position: (song.at(-1) ?? [0, 0, 0])[2] + 0.1,
                    type: BufferEventType.Finish,
                    part
                }
            ]
        }

        const buffer: BufferEvent[] = [
            setInitialTempo(120),
            ...sitOut(bass, drum, keys),
            ...makeEventsFromSong(lead, songNotes),
        ]

        return buffer
    },
}

export default chart