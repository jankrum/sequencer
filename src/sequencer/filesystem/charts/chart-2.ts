import { Chart, ScoreEventType } from '../types.ts'
import dummyScript from '../scripts/dummy.ts'

const chart: Chart = {
    title: "Lead Scale",
    parts: {
        lead: {
            script: dummyScript,
            score: [
                {
                    position: -Infinity,
                    type: ScoreEventType.Tempo,
                    bpm: 60
                },
                {
                    position: 0,
                    type: ScoreEventType.Note,
                    pitch: 60,
                    duration: 1
                },
                {
                    position: 1,
                    type: ScoreEventType.Note,
                    pitch: 62,
                    duration: 1
                },
                {
                    position: 2,
                    type: ScoreEventType.Note,
                    pitch: 64,
                    duration: 1
                },
                {
                    position: 3,
                    type: ScoreEventType.Note,
                    pitch: 65,
                    duration: 1
                },
                {
                    position: 4,
                    type: ScoreEventType.Note,
                    pitch: 67,
                    duration: 1
                },
                {
                    position: 5,
                    type: ScoreEventType.Note,
                    pitch: 69,
                    duration: 1
                },
                {
                    position: 6,
                    type: ScoreEventType.Note,
                    pitch: 71,
                    duration: 1
                },
                {
                    position: 7,
                    type: ScoreEventType.Note,
                    pitch: 72,
                    duration: 1
                },
            ],
        },
    },
}

export default chart