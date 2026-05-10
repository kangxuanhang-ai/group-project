import layout from '@/layout/index.vue'

export default [
    {
        path: '/word-learn',
        component: layout,
        children: [
            { path: 'index', component: () => import('@/views/WordLearn/index.vue') },
        ]
    }
]
