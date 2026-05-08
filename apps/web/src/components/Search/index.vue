<template>
    <teleport to="body">
        <Transition name="fade">
            <div v-if="isShow" class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
                @click.self="closeSearch">
                <div class="w-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div class="flex items-center border-b border-gray-100 px-4">
                        <el-icon class="text-gray-400 mr-2" :size="20">
                            <Search />
                        </el-icon>
                        <input ref="inputRef" v-focus v-model="search" placeholder="搜索单词..."
                            class="flex-1 h-14 text-lg outline-none border-none bg-transparent" />
                        <span class="text-xs text-gray-400">ESC 关闭</span>
                    </div>
                    <div class="max-h-[500px] overflow-y-auto p-2">
                        <div v-for="item in wordList" :key="item.id"
                            class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                            @click="copyWord(item.word)">
                            <div>
                                <div class="text-base font-semibold text-gray-800">{{ item.word }}</div>
                                <div class="text-sm text-gray-500">{{ item.phonetic }}</div>
                                <div class="text-sm text-gray-600 line-clamp-1">{{ item.translation }}</div>
                            </div>
                            <el-icon class="text-gray-300 hover:text-indigo-500" :size="18">
                                <CopyDocument />
                            </el-icon>
                        </div>
                        <div v-if="wordList.length === 0 && search" class="text-center py-10 text-gray-400">
                            未找到匹配的单词
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </teleport>
</template>

<script setup lang="ts">
import { ref, customRef, onUnmounted } from 'vue'
import { Search, CopyDocument } from '@element-plus/icons-vue'
import { getWordBookList } from '@/apis/word-book'
import type { Word } from '@en/common/word'
import { ElMessage } from 'element-plus'

const isShow = ref(false)
const wordList = ref<Word[]>([])

let timer: ReturnType<typeof setTimeout> | null = null
const search = customRef((track, trigger) => {
    return {
        get() {
            track()
            return searchValue
        },
        set(val: string) {
            searchValue = val
            trigger()
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
                fetchList(val)
            }, 500)
        },
    }
})
let searchValue = ''

const fetchList = async (word: string) => {
    const res = await getWordBookList({ word, page: 1, pageSize: 20 })
    if (res.success) {
        wordList.value = res.data.list
    }
}

const copyWord = async (word: string) => {
    try {
        await navigator.clipboard.writeText(word)
        ElMessage.success(`已复制: ${word}`)
    } catch {
        ElMessage.warning('复制失败')
    }
}

const closeSearch = () => {
    isShow.value = false
    searchValue = ''
    wordList.value = []
}

const handleKeydown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        isShow.value = true
    }
    if (e.key === 'Escape' && isShow.value) {
        closeSearch()
    }
}

window.addEventListener('keydown', handleKeydown)
onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
</style>
