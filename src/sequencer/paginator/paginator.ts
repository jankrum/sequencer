import Playbacker from '../playbacker/playbacker.ts'
import Transporter from '../transporter.ts'

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

            const urlParams = new URLSearchParams(window.location.search)
            urlParams.set('page', this.#chartIndex.toString())
            const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`
            window.history.replaceState(null, '', newUrl)
        }
    }

    start(): void {
        const urlParams = new URLSearchParams(window.location.search)
        const pageParam = urlParams.get('page')

        const pageIndex = parseInt(pageParam || '0')
        if (pageIndex >= 0 && pageIndex < setlistLength) {
            this.#chartIndex = pageIndex
        }

        this.#subscription()
    }
}