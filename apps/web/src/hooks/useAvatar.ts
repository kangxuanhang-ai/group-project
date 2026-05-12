import { uploadUrl } from '@/apis'
import defaultAvatar from '@/assets/images/avatar/1.jpg'
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
export const useAvatar = () => {
    const userStore = useUserStore()
    const avatar = computed(() => {
        if(userStore.getUser?.avatar){
            return '/files' + userStore.getUser.avatar
        }else{
            return defaultAvatar
        }
    })
    return {avatar}
}
