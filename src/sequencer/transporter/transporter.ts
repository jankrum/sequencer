import { TransporterConfig, TransporterType, PlaybackState } from '../../types.ts'
import dm from '../../dm.ts'
import Paginator from '../paginator/paginator.ts'
import Playbacker from '../playbacker/playbacker.ts'

const enum TransporterButtonType {
    Previous = 'previous',
    Play = 'play',
    Pause = 'pause',
    Stop = 'stop',
    Next = 'next',
}

//#region DomTransporter
function makeIntoDomTransporter(transporter: Transporter): void {
    // Used between the methods
    const chartTitleHeading = dm('h2')
    const buttons: { [key in TransporterButtonType]: HTMLButtonElement } = {
        [TransporterButtonType.Previous]: dm('button', { class: 'transporter-button' }, '⏮') as HTMLButtonElement,
        [TransporterButtonType.Play]: dm('button', { class: 'transporter-button' }, '▶') as HTMLButtonElement,
        [TransporterButtonType.Pause]: dm('button', { class: 'transporter-button' }, '⏸') as HTMLButtonElement,
        [TransporterButtonType.Stop]: dm('button', { class: 'transporter-button' }, '⏹') as HTMLButtonElement,
        [TransporterButtonType.Next]: dm('button', { class: 'transporter-button' }, '⏭') as HTMLButtonElement,
    }

    // Connect to what the transporter calls
    transporter.connect = (paginator: Paginator, playbacker: Playbacker): void => {
        buttons[TransporterButtonType.Previous].addEventListener('click', () => paginator.goPrevious())
        buttons[TransporterButtonType.Next].addEventListener('click', () => paginator.goNext())

        buttons[TransporterButtonType.Play].addEventListener('click', () => playbacker.play())
        buttons[TransporterButtonType.Pause].addEventListener('click', () => playbacker.pause())
        buttons[TransporterButtonType.Stop].addEventListener('click', () => playbacker.stop())
    }

    // Change the chart title and button states
    transporter.changeChart = (chartTitle: string, canPrevious: boolean, canNext: boolean): void => {
        chartTitleHeading.innerText = chartTitle
        buttons[TransporterButtonType.Previous].disabled = !canPrevious
        buttons[TransporterButtonType.Next].disabled = !canNext
    }

    // Change the button states
    transporter.changePlayback = (playbackState: PlaybackState): void => {
        buttons[TransporterButtonType.Play].disabled = playbackState === PlaybackState.Playing
        buttons[TransporterButtonType.Pause].disabled = playbackState !== PlaybackState.Playing
        buttons[TransporterButtonType.Stop].disabled = playbackState === PlaybackState.Stopped
    }

    // Render the transporter
    const buttonDiv = dm('div', {}, ...Object.values(buttons))
    const div = dm('div', { id: 'transporter' }, chartTitleHeading, buttonDiv) as HTMLDivElement

    transporter.render = (): HTMLDivElement | null => div
}
//#endregion

//#region MidiTransporter
// function makeIntoMidiTransporter(transporter: Transporter, config: TransporterConfig): void {
//     transporter.connect = (paginator: Paginator, playbacker: Playbacker): void => { }

//     transporter.changeChart = (chartTitle: string, canPrevious: boolean, canNext: boolean): void => { }

//     transporter.changePlayback = (playbackState: PlaybackState): void => { }

//     transporter.render = (): HTMLDivElement | null => { return null }
// }
//#endregion

//#region WebrtcTransporter
// function makeWebrtcTransporter(transporter: Transporter, config: TransporterConfig): void {
//     transporter.connect = (paginator: Paginator, playbacker: Playbacker): void => { }

//     transporter.changeChart = (chartTitle: string, canPrevious: boolean, canNext: boolean): void => { }

//     transporter.changePlayback = (playbackState: PlaybackState): void => { }

//     transporter.render = (): HTMLDivElement | null => { return null }
// }
//#endregion

//#region Transporter
export default class Transporter {
    constructor(config: TransporterConfig) {
        switch (config.type) {
            case TransporterType.Dom:
                makeIntoDomTransporter(this)
                break
            // case TransporterType.Midi:
            //     makeIntoMidiTransporter(this, config)
            //     break
            // case TransporterType.WebRTC:
            //     makeWebrtcTransporter(this, config)
            //     break
            default:
                throw new Error(`Invalid Transporter type: ${config}`)
        }
    }

    connect(_paginator: Paginator, _playbacker: Playbacker): void { }

    changeChart(_chartTitle: string, _canPrevious: boolean, _canNext: boolean): void { }

    changePlayback(_playbackState: PlaybackState): void { }

    render(): HTMLDivElement | null { return null }
}
//#endregion