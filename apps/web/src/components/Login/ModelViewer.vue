<template>
    <div ref="containerRef"
        class="relative w-[800px] h-full bg-linear-to-br from-gray-400 via-gray-500 to-gray-600 overflow-hidden select-none">
        <div class="absolute top-6 left-6 z-20">
            <div class="flex items-center gap-2">
                <div
                    class="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-[10px] flex items-center justify-center">
                    <span class="text-white font-bold text-xl">E</span>
                </div>
                <span class="text-white text-xl font-bold">English App</span>
            </div>
        </div>

        <div class="absolute top-6 right-6 z-20">
            <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                <button :class="btnClass('login')" @click="$emit('update:formType', 'login')">登录</button>
                <button :class="btnClass('register')" @click="$emit('update:formType', 'register')">注册</button>
            </div>
        </div>

        <div ref="sceneRef" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[550px] h-[400px]">
            <div class="character" :style="pStyle">
                <div ref="purpleEyesRef" class="eyes face-transition" :style="pEyesStyle">
                    <div ref="purpleEye1Ref" class="eye-ball" :style="eyeBallStyle(state.isPurpleBlinking)">
                        <div ref="purplePupil1Ref" class="pupil" :style="pupilStyle(pupils.pp1)"></div>
                    </div>
                    <div ref="purpleEye2Ref" class="eye-ball" :style="eyeBallStyle(state.isPurpleBlinking)">
                        <div ref="purplePupil2Ref" class="pupil" :style="pupilStyle(pupils.pp2)"></div>
                    </div>
                </div>
            </div>

            <div class="character" :style="bStyle">
                <div ref="blackEyesRef" class="eyes face-transition" :style="bEyesStyle">
                    <div ref="blackEye1Ref" class="eye-ball" :style="eyeBallStyle(state.isBlackBlinking)">
                        <div ref="blackPupil1Ref" class="pupil" :style="pupilStyle(pupils.bp1)"></div>
                    </div>
                    <div ref="blackEye2Ref" class="eye-ball" :style="eyeBallStyle(state.isBlackBlinking)">
                        <div ref="blackPupil2Ref" class="pupil" :style="pupilStyle(pupils.bp2)"></div>
                    </div>
                </div>
            </div>

            <div class="character" :style="oStyle">
                <div ref="orangeEyesRef" class="eyes fast-face-transition" :style="oEyesStyle">
                    <div ref="orangePupil1Ref" class="pupil" :style="pupilStyle(pupils.op1)"></div>
                    <div ref="orangePupil2Ref" class="pupil" :style="pupilStyle(pupils.op2)"></div>
                </div>
            </div>

            <div class="character" :style="yStyle">
                <div ref="yellowEyesRef" class="eyes fast-face-transition" :style="yEyesStyle">
                    <div ref="yellowPupil1Ref" class="pupil" :style="pupilStyle(pupils.yp1)"></div>
                    <div ref="yellowPupil2Ref" class="pupil" :style="pupilStyle(pupils.yp2)"></div>
                </div>
                <div class="mouth" :style="yMouthStyle"></div>
            </div>
        </div>

        <div class="absolute inset-0 bg-grid-white-5"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
    formType: 'login' | 'register'
    isTyping?: boolean
    passwordLength?: number
    showPassword?: boolean
}>()

defineEmits<{
    (e: 'update:formType', val: 'login' | 'register'): void
}>()

const containerRef = ref<HTMLElement>()
const sceneRef = ref<HTMLElement>()
const purpleEyesRef = ref<HTMLElement>()
const blackEyesRef = ref<HTMLElement>()
const orangeEyesRef = ref<HTMLElement>()
const yellowEyesRef = ref<HTMLElement>()
const purpleEye1Ref = ref<HTMLElement>()
const purpleEye2Ref = ref<HTMLElement>()
const blackEye1Ref = ref<HTMLElement>()
const blackEye2Ref = ref<HTMLElement>()
const purplePupil1Ref = ref<HTMLElement>()
const purplePupil2Ref = ref<HTMLElement>()
const blackPupil1Ref = ref<HTMLElement>()
const blackPupil2Ref = ref<HTMLElement>()
const orangePupil1Ref = ref<HTMLElement>()
const orangePupil2Ref = ref<HTMLElement>()
const yellowPupil1Ref = ref<HTMLElement>()
const yellowPupil2Ref = ref<HTMLElement>()

const state = reactive({
    mouseX: 0,
    mouseY: 0,
    isPurpleBlinking: false,
    isBlackBlinking: false,
    isPurplePeeking: false,
})

const pupils = reactive({
    pp1: { x: 0, y: 0 },
    pp2: { x: 0, y: 0 },
    bp1: { x: 0, y: 0 },
    bp2: { x: 0, y: 0 },
    op1: { x: 0, y: 0 },
    op2: { x: 0, y: 0 },
    yp1: { x: 0, y: 0 },
    yp2: { x: 0, y: 0 },
})

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const pupilOffset = (eyeEl: HTMLElement | undefined | null, maxDist: number) => {
    if (!eyeEl) return { x: 0, y: 0 }
    const r = eyeEl.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const dx = state.mouseX - cx
    const dy = state.mouseY - cy
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy), maxDist)
    const angle = Math.atan2(dy, dx)
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist }
}

const renderCharacters = () => {
    pupils.pp1 = pupilOffset(purplePupil1Ref.value, 5)
    pupils.pp2 = pupilOffset(purplePupil2Ref.value, 5)
    pupils.bp1 = pupilOffset(blackPupil1Ref.value, 4)
    pupils.bp2 = pupilOffset(blackPupil2Ref.value, 4)
    pupils.op1 = pupilOffset(orangePupil1Ref.value, 5)
    pupils.op2 = pupilOffset(orangePupil2Ref.value, 5)
    pupils.yp1 = pupilOffset(yellowPupil1Ref.value, 5)
    pupils.yp2 = pupilOffset(yellowPupil2Ref.value, 5)
}

const isHiding = () => (props.passwordLength ?? 0) > 0 && !props.showPassword
const isPeeking = () => (props.passwordLength ?? 0) > 0 && !!props.showPassword

const btnClass = (type: 'login' | 'register') => {
    const active = props.formType === type
    return active
        ? 'bg-indigo-500 text-white shadow-lg px-4 py-2 rounded-md text-sm font-medium transition-all'
        : 'text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-all'
}

const pStyle = computed(() => {
    const hiding = isHiding()
    const h = (props.isTyping || hiding) ? '440px' : '400px'
    let transform = `skewX(0deg)`
    if (isPeeking()) {
        transform = 'skewX(0deg)'
    } else if (props.isTyping || hiding) {
        transform = 'skewX(-12deg) translateX(40px)'
    }
    return { height: h, transform, left: '70px', width: '180px', backgroundColor: '#6C3FF5', borderRadius: '10px 10px 0 0', zIndex: 1, position: 'absolute' as const, bottom: 0 }
})

const pEyesStyle = computed(() => {
    const peeking = isPeeking()
    const typing = props.isTyping
    const left = peeking ? '20px' : typing ? '55px' : '45px'
    const top = peeking ? '35px' : typing ? '65px' : '40px'
    return { left, top, display: 'flex', gap: '8px', position: 'absolute' as const }
})

const bStyle = computed(() => {
    let transform = 'skewX(0deg)'
    if (isPeeking()) {
        transform = 'skewX(0deg)'
    } else if (props.isTyping) {
        transform = 'skewX(10deg) translateX(20px)'
    }
    return { transform, left: '240px', width: '120px', height: '310px', backgroundColor: '#2D2D2D', borderRadius: '8px 8px 0 0', zIndex: 2, position: 'absolute' as const, bottom: 0 }
})

const bEyesStyle = computed(() => {
    const peeking = isPeeking()
    const typing = props.isTyping
    const left = peeking ? '10px' : typing ? '32px' : '26px'
    const top = peeking ? '28px' : typing ? '12px' : '32px'
    return { left, top, display: 'flex', gap: '6px', position: 'absolute' as const }
})

const oStyle = computed(() => ({
    left: '0', width: '240px', height: '200px', backgroundColor: '#FF9B6B',
    borderRadius: '120px 120px 0 0', zIndex: 3, position: 'absolute' as const, bottom: 0
}))

const oEyesStyle = computed(() => {
    const peeking = isPeeking()
    return {
        left: peeking ? '50px' : '82px', top: peeking ? '85px' : '90px',
        display: 'flex', gap: '8px', position: 'absolute' as const
    }
})

const yStyle = computed(() => ({
    left: '310px', width: '140px', height: '230px', backgroundColor: '#E8D754',
    borderRadius: '70px 70px 0 0', zIndex: 4, position: 'absolute' as const, bottom: 0
}))

const yEyesStyle = computed(() => {
    const peeking = isPeeking()
    return {
        left: peeking ? '20px' : '52px', top: peeking ? '35px' : '40px',
        display: 'flex', gap: '6px', position: 'absolute' as const
    }
})

const yMouthStyle = computed(() => {
    const peeking = isPeeking()
    const w = peeking ? '60px' : '80px'
    const left = peeking ? '20px' : '40px'
    return {
        position: 'absolute' as const, left, top: '88px', width: w, height: '4px',
        backgroundColor: '#2D2D2D', borderRadius: '999px',
        transition: 'all 0.2s ease-out'
    }
})

const eyeBallStyle = (isBlinking: boolean) => ({
    width: '18px',
    height: isBlinking ? '2px' : '18px',
    backgroundColor: isBlinking ? 'transparent' : 'white',
    borderRadius: '999px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease-out',
})

const pupilStyle = (pos: { x: number; y: number }) => ({
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    width: '8px',
    height: '8px',
    backgroundColor: '#2D2D2D',
    borderRadius: '50%',
    transition: 'transform 0.1s ease-out',
})

const scheduleBlink = (key: 'isPurpleBlinking' | 'isBlackBlinking') => {
    const interval = () => setTimeout(() => {
        state[key] = true
        setTimeout(() => {
            state[key] = false
            interval()
        }, 150)
    }, Math.random() * 4000 + 3000)
    interval()
}

let peekTimer: ReturnType<typeof setTimeout> | null = null
let peekResetTimer: ReturnType<typeof setTimeout> | null = null

const schedulePeek = () => {
    if (peekTimer) clearTimeout(peekTimer)
    if (peekResetTimer) clearTimeout(peekResetTimer)
    if (isPeeking()) {
        peekTimer = setTimeout(() => {
            state.isPurplePeeking = true
            peekResetTimer = setTimeout(() => {
                state.isPurplePeeking = false
                schedulePeek()
            }, 800)
        }, Math.random() * 3000 + 2000)
    } else {
        state.isPurplePeeking = false
    }
}

const handleMouseMove = (e: MouseEvent) => {
    state.mouseX = e.clientX
    state.mouseY = e.clientY
    renderCharacters()
}

onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove)
    scheduleBlink('isPurpleBlinking')
    scheduleBlink('isBlackBlinking')
})

onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    if (peekTimer) clearTimeout(peekTimer)
    if (peekResetTimer) clearTimeout(peekResetTimer)
})
</script>

<style scoped>
.character {
    position: absolute;
    bottom: 0;
    transition: all 0.7s ease-in-out;
    transform-origin: bottom center;
}

.eyes {
    position: absolute;
    transition: all 0.7s ease-in-out;
}

.fast-face-transition {
    transition: all 0.2s ease-out;
}

.mouth {
    position: absolute;
    border-radius: 999px;
    transition: all 0.2s ease-out;
}

.bg-grid-white-5 {
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
}
</style>