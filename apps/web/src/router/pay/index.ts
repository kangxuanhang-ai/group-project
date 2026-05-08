import layout from '@/layout/index.vue'

export default [
    {
        path: '/pay',
        component: layout,
        children: [
            { path: 'result', component: () => import('@/views/Pay/Result.vue') },
        ]
    }
]
