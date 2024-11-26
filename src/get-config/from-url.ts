import { Config } from '../types.ts'
import getProblems from './get-problems.ts'

export default function getConfigFromUrl(): Config | null {
    const urlParams = new URLSearchParams(window.location.search)
    const encodedConfig = urlParams.get('config')

    try {
        if (!encodedConfig) {
            return null
        }

        const base64String = decodeURIComponent(encodedConfig)
        const jsonString = atob(base64String)

        const config = JSON.parse(jsonString) as Config

        const problems = getProblems(config)

        if (problems.length) {
            throw new Error(problems.join('\n'))
        }

        return config
    } catch (error: any) {
        alert(error.message)
        console.error(error)

        urlParams.delete('config')
        const newUrl = `${window.location.origin}${window.location.pathname}?${urlParams.toString()}`
        window.history.replaceState(null, '', newUrl)
    }

    return null
}