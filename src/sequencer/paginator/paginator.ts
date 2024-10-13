import Transporter from '../transporter/transporter.ts'
import Playbacker from '../playbacker/playbacker.ts'

import setlist from './filesystem/setlist.ts'
const setlistLength = setlist.length

export default class Paginator {
    #chartIndex = 0
    #subscription: (() => void) = () => { }

    goPrevious(): void {
        if (this.#chartIndex > 0) {
            this.#chartIndex -= 1
            this.#subscription()
        }
    }

    goNext(): void {
        if (this.#chartIndex < setlistLength - 1) {
            this.#chartIndex += 1
            this.#subscription()
        }
    }

    connect(transporter: Transporter, playbacker: Playbacker): void {
        this.#subscription = () => {
            const chart = setlist[this.#chartIndex]
            const chartTitle = chart.title
            const canPrevious = this.#chartIndex > 0
            const canNext = this.#chartIndex < setlistLength - 1

            transporter.changeChart(chartTitle, canPrevious, canNext)
            playbacker.changeChart(chart)
        }
    }

    start(): void {
        this.#subscription()
    }
}