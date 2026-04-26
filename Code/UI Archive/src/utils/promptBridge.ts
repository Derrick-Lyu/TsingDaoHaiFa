export type PortalPromptMessage = {
  type?: string
  payload?: string
}

const isFunction = <T extends (...args: never[]) => unknown>(value: unknown): value is T =>
  typeof value === 'function'

export const getHostSendPrompt = () => {
  const maybeFn = (window as Window & { sendPrompt?: (prompt: string) => void }).sendPrompt
  return isFunction<(prompt: string) => void>(maybeFn) ? maybeFn : null
}

export const invokePrompt = (text: string) => {
  const sendPrompt = getHostSendPrompt()
  if (sendPrompt) {
    sendPrompt(text)
    return
  }
  console.info('[react-portal] sendPrompt:', text)
}

export const setupPortalPromptListener = (onPrompt: (text: string) => void) => {
  const handleMessage = (event: MessageEvent<PortalPromptMessage>) => {
    if (event.data?.type !== 'portal-send-prompt') {
      return
    }
    const text = event.data.payload ?? ''
    onPrompt(text)
    invokePrompt(text)
  }

  window.addEventListener('message', handleMessage)
  return () => window.removeEventListener('message', handleMessage)
}
