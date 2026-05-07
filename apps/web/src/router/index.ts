import { createRouter, createWebHistory } from 'vue-router'
import home from './home/index'
import wordBook from './word-book/index'
import course from './course/index'
import chat from './chat/index'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...home, //主页
    ...wordBook, //词库
    ...course, //课程
    ...chat, //聊天
  ]
})

export default router
