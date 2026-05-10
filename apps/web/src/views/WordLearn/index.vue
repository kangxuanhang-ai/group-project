<template>
  <div class="min-h-screen bg-zinc-50/80">
    <!-- 完成页面 -->
    <div v-if="showComplete" class="min-h-screen bg-zinc-50/80 flex flex-col items-center justify-center">
      <div class="w-[1200px] mx-auto px-4 py-8">
        <div class="bg-white rounded-2xl shadow-sm border border-zinc-100 p-16 text-center">
          <h1 class="text-2xl font-bold text-zinc-800 mb-4">本组 10 个词已学完</h1>
          <button
            @click="restartLearning"
            class="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            再练一组
          </button>
        </div>
      </div>
    </div>

    <!-- 学习页面 -->
    <div v-else class="w-[1200px] mx-auto px-4 py-8">
      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-zinc-800">{{ courseName }}</h1>
        <p class="text-sm text-zinc-500 mt-2">请根据释义和翻译拼写单词</p>
      </div>

      <!-- 进度 -->
      <div class="text-sm text-zinc-500 mb-6">第 {{ currentIndex + 1 }} / {{ words.length }} 个</div>

      <!-- 单词卡片 -->
      <div class="bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
        <!-- 发音按钮和眼睛按钮 -->
        <div class="flex justify-end gap-3 mb-6">
          <button
            @click="speakWord"
            class="p-3 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
            title="发音"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
          <button
            @click="toggleWordMask"
            class="p-3 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
            :title="showWordMask ? '显示答案' : '隐藏答案'"
          >
            <svg v-if="showWordMask" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>
        </div>

        <!-- 单词显示区域（带紫色模糊遮罩） -->
        <div class="flex justify-center mb-6">
          <div class="relative">
            <span class="text-3xl font-semibold text-purple-600">{{ currentWord?.word }}</span>
            <div
              v-if="showWordMask"
              class="absolute bg-purple-300/70 backdrop-blur-sm rounded-md"
              :style="{ width: `${(currentWord?.word.length || 0) * 24 + 8}px`, height: '38px', top: '-2px', left: '-4px' }"
            ></div>
          </div>
        </div>

        <!-- 释义 -->
        <div class="mb-6 p-4 bg-zinc-50 rounded-xl">
          <div class="text-xs text-zinc-400 mb-2">释义</div>
          <p class="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">{{ currentWord?.definition }}</p>
        </div>

        <!-- 翻译 -->
        <div class="mb-8 p-4 bg-zinc-50 rounded-xl">
          <div class="text-xs text-zinc-400 mb-2">翻译</div>
          <p class="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">{{ currentWord?.translation }}</p>
        </div>

        <!-- 拼写输入框（下划线样式） -->
        <div class="mb-8">
          <div class="text-xs text-zinc-400 mb-3">拼写</div>
          <div class="flex gap-4 justify-center">
            <div v-for="(letter, index) in letterInputs" :key="index" class="flex flex-col items-center">
              <input
                :ref="el => inputRefs[index] = el"
                v-model="letterInputs[index]"
                type="text"
                maxlength="1"
                @input="handleInput($event, index)"
                @keydown="handleKeydown($event, index)"
                :class="[
                  'w-10 h-12 text-center text-xl font-semibold bg-transparent border-b-2 outline-none transition-colors lowercase',
                  getInputClass(index)
                ]"
              />
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end gap-4">
          <button
            @click="prevWord"
            :disabled="currentIndex === 0"
            :class="[
              'px-6 py-2.5 rounded-xl font-medium transition-colors',
              currentIndex === 0
                ? 'text-zinc-400 bg-zinc-100 cursor-not-allowed'
                : 'text-zinc-600 bg-zinc-100 hover:bg-zinc-200 cursor-pointer'
            ]"
          >
            上一个
          </button>
          <button
            @click="nextWord"
            :disabled="!isWordCorrect"
            :class="[
              'px-6 py-2.5 rounded-xl font-medium transition-colors',
              isWordCorrect
                ? 'text-white bg-indigo-600 hover:bg-indigo-500 cursor-pointer'
                : 'text-zinc-400 bg-zinc-100 cursor-not-allowed'
            ]"
          >
            下一个
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { getWordsForLearning, markWordsAsLearned } from '@/apis/word'
import { useUserStore } from '@/stores/user'
import { useLogin } from '@/hooks/useLogin'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const { login } = useLogin()

const courseName = ref('高考单词')
const words = ref<any[]>([])
const currentIndex = ref(0)
const letterInputs = ref<string[]>([])
const inputRefs = ref<any[]>([])
const showComplete = ref(false)
const validationState = ref<string[]>([]) // 'correct', 'error', ''
const showWordMask = ref(true) // 控制单词遮罩显示

const currentWord = computed(() => words.value[currentIndex.value])

const isWordCorrect = computed(() => {
  if (!currentWord.value) return false
  const userInput = letterInputs.value.join('').toLowerCase()
  return userInput === currentWord.value.word.toLowerCase() && letterInputs.value.length === currentWord.value.word.length
})

const getInputClass = (index: number) => {
  if (!currentWord.value) return 'border-zinc-300'
  if (validationState.value[index] === 'correct') return 'border-purple-500 text-purple-600'
  if (validationState.value[index] === 'error') return 'border-red-500 text-red-600'
  if (inputRefs.value[index] === document.activeElement) return 'border-indigo-500'
  return 'border-zinc-300 focus:border-indigo-400'
}

const handleInput = (event: any, index: number) => {
  const value = event.target.value.toLowerCase()
  letterInputs.value[index] = value
  
  validateInput()
  
  if (value && index < letterInputs.value.length - 1) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus()
    })
  }
}

const handleKeydown = (event: KeyboardEvent, index: number) => {
  if (event.key === 'Backspace') {
    if (!letterInputs.value[index] && index > 0) {
      letterInputs.value[index] = ''
      nextTick(() => {
        inputRefs.value[index - 1]?.focus()
        inputRefs.value[index - 1]?.select()
      })
    }
  } else if (event.key === 'ArrowLeft' && index > 0) {
    inputRefs.value[index - 1]?.focus()
  } else if (event.key === 'ArrowRight' && index < letterInputs.value.length - 1) {
    inputRefs.value[index + 1]?.focus()
  }
}

const validateInput = () => {
  if (!currentWord.value) return
  
  const word = currentWord.value.word.toLowerCase()
  validationState.value = letterInputs.value.map((letter, index) => {
    if (!letter) return ''
    return letter.toLowerCase() === word[index]?.toLowerCase() ? 'correct' : 'error'
  })
}

const speakWord = () => {
  if (!currentWord.value?.word) return
  
  const utterance = new SpeechSynthesisUtterance(currentWord.value.word)
  utterance.lang = 'en-US'
  utterance.rate = 0.8
  speechSynthesis.speak(utterance)
}

const toggleWordMask = () => {
  showWordMask.value = !showWordMask.value
}

const initLetterInputs = () => {
  if (currentWord.value) {
    letterInputs.value = new Array(currentWord.value.word.length).fill('')
    validationState.value = new Array(currentWord.value.word.length).fill('')
    showWordMask.value = true
    nextTick(() => {
      inputRefs.value[0]?.focus()
    })
  }
}

const prevWord = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    initLetterInputs()
  }
}

const nextWord = async () => {
  if (!isWordCorrect.value) return
  
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++
    initLetterInputs()
  } else {
    showComplete.value = true
  }
}

const restartLearning = async () => {
  try {
    const wordIds = words.value.map(w => w.id)
    
    if (wordIds.length === 0) {
      ElMessage.error('没有可标记的单词')
      return
    }
    
    if (!userStore.isLoggedIn) {
      await login()
      if (!userStore.isLoggedIn) {
        ElMessage.error('登录失败')
        return
      }
    }
    
    console.log('User logged in:', userStore.isLoggedIn)
    console.log('Access token exists:', !!userStore.getAccessToken)
    console.log('Marking words as learned:', wordIds)
    
    try {
      const res = await markWordsAsLearned(wordIds)
      console.log('API response:', res)
      
      if (res.success) {
        ElMessage.success('单词学习完成！')
        
        const currentUser = userStore.getUser
        if (currentUser) {
          const updatedUser = { ...currentUser, wordNumber: (currentUser.wordNumber || 0) + wordIds.length }
          userStore.setUser(updatedUser)
        }
        
        await fetchWords()
        showComplete.value = false
      } else {
        ElMessage.error(res.message || '标记学习失败')
      }
    } catch (apiError: any) {
      console.error('API call failed:', apiError)
      if (apiError.response?.status === 401) {
        ElMessage.error('登录已过期，请重新登录')
        await login()
        if (userStore.isLoggedIn) {
          await restartLearning()
        }
      } else {
        ElMessage.error('网络错误，请重试')
      }
    }
  } catch (error: any) {
    console.error('restartLearning error:', error)
    ElMessage.error('操作失败，请重试')
  }
}

const mockWords = [
  {
    id: 'clp1q23abc123',
    word: 'dream',
    definition: 'n. a series of mental images and emotions occurring during sleep; imaginative thoughts indulged in while awake; a cherished aspiration, ambition, or ideal',
    translation: 'n. 梦，梦想，理想'
  },
  {
    id: 'clp1q23abc124',
    word: 'shoulder',
    definition: 'n. the part of the body between the neck and upper arm; a cut of meat from this part; a burden or responsibility',
    translation: 'n. 肩，肩膀；负担，责任'
  },
  {
    id: 'clp1q23abc125',
    word: 'basket',
    definition: 'n. a container typically made of woven strips of wood or plastic; the amount held by a basket',
    translation: 'n. 篮子，筐'
  },
  {
    id: 'clp1q23abc126',
    word: 'kitchen',
    definition: 'n. a room or area where food is prepared and cooked',
    translation: 'n. 厨房'
  },
  {
    id: 'clp1q23abc127',
    word: 'garden',
    definition: 'n. a plot of ground where plants, flowers, or vegetables are cultivated; a yard or park',
    translation: 'n. 花园，菜园，公园'
  },
  {
    id: 'clp1q23abc128',
    word: 'school',
    definition: 'n. an institution for educating children; a place of learning; a group of people sharing similar principles',
    translation: 'n. 学校，学院；学派'
  },
  {
    id: 'clp1q23abc129',
    word: 'library',
    definition: 'n. a room or building containing collections of books, periodicals, and sometimes films and recorded music for use or borrowing by the public',
    translation: 'n. 图书馆，藏书室'
  },
  {
    id: 'clp1q23abc130',
    word: 'bedroom',
    definition: 'n. a room for sleeping in',
    translation: 'n. 卧室'
  },
  {
    id: 'clp1q23abc131',
    word: 'window',
    definition: 'n. an opening in the wall or roof of a building or vehicle that is fitted with glass or other transparent material in a frame to admit light or air and allow people to see out',
    translation: 'n. 窗户，窗口'
  },
  {
    id: 'clp1q23abc132',
    word: 'drawer',
    definition: 'n. a sliding boxlike container in a piece of furniture; a person who draws',
    translation: 'n. 抽屉；画家'
  }
]

const fetchWords = async () => {
  if (!userStore.isLoggedIn) {
    await login()
    if (!userStore.isLoggedIn) {
      ElMessage.error('请先登录')
      return
    }
  }
  
  try {
    const res = await getWordsForLearning(10)
    
    if (res.success && res.data && res.data.length > 0) {
      words.value = res.data
    } else {
      words.value = []
      ElMessage.info('已学完所有单词')
      return
    }
  } catch (error) {
    console.error('fetchWords error:', error)
    ElMessage.error('获取单词失败，请重试')
    return
  }
  
  currentIndex.value = 0
  initLetterInputs()
}

watch(currentIndex, () => {
  initLetterInputs()
})

onMounted(() => {
  fetchWords()
})
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>
