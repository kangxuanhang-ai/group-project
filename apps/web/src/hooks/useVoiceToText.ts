import { ref } from 'vue'

export interface Options {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
}

let instance: SpeechRecognition | null = null

const getInstance = (options: Options) => {
  const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!speechRecognition) {
    throw new Error('当前浏览器不支持语音识别')
  }

  const {
    lang = 'zh-CN',
    continuous = false,
    interimResults = false,
    maxAlternatives = 1
  } = options

  // 每次获取都重新创建，避免状态污染
  instance = new speechRecognition()
  instance.lang = lang
  instance.continuous = continuous
  instance.interimResults = interimResults
  instance.maxAlternatives = maxAlternatives

  return instance
}

export const useVoiceToText = (options: Options) => {
  const recognition = getInstance(options)
  const isRecording = ref(false)

  // 自然停止时更新状态
  recognition.onend = () => {
    isRecording.value = false
  }

  // 开启语音转文字
const start = (callback?: (result: string) => void) => {
  isRecording.value = true
  recognition.start()

  // 输出的结果
  recognition.onresult = (event) => {
    let fullText = ''
    for (let i = 0; i < event.results.length; i++) {
      fullText += event.results[i][0].transcript
    }
    callback?.(fullText)
    console.log(fullText)
  }
}

  // 主动停止
  const stop = () => {
    isRecording.value = false
    recognition.stop()
  }

  return {
    isRecording,
    start,
    stop
  }
}