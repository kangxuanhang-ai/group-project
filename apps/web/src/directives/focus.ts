import type { App, Directive } from 'vue'

const vFocus: Directive = {
    mounted(el) {
        el.focus()
    },
}

export default {
    install(app: App) {
        app.directive('focus', vFocus)
    },
}
