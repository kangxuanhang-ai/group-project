<template>
    <div class="mx-auto w-[1200px] px-4 py-6">
        <div class="flex items-center justify-between">
            <div>
                <div class="text-xl font-extrabold text-slate-900">设置</div>
                <div class="mt-1 text-sm text-slate-500">在这里修改你的个人信息与头像</div>
            </div>

            <div class="flex gap-2">
                <el-button @click="init">重置</el-button>
                <el-button @click="onSave" type="primary">保存</el-button>
            </div>
        </div>

        <el-row :gutter="16" class="mt-4">
            <el-col :span="8">
                <el-card shadow="never">
                    <template #header>
                        <div class="font-bold">头像</div>
                    </template>

                    <div class="flex items-center gap-4">
                        <img class="w-20 h-20 rounded-full object-cover border-2 border-gray-200" :src="previewUrl || avatar"
                            loading="lazy" referrerpolicy="no-referrer" />

                        <div class="flex flex-col gap-2">
                            <el-upload :show-file-list="false" :auto-upload="false" accept="image/*" :on-change="onAvatarSelect">
                                <el-button type="primary">选择头像</el-button>
                            </el-upload>

                            <div class="text-xs text-slate-500">
                                支持 png/jpg/webp，建议小于 2MB
                            </div>
                        </div>
                    </div>
                </el-card>

                <el-card shadow="never" class="mt-4">
                    <template #header>
                        <div class="font-bold">账号</div>
                    </template>

                    <div class="text-sm text-slate-600">
                        <div class="flex items-center justify-between">
                            <span>登录状态</span>
                            <el-tag type="success">
                                已登录
                            </el-tag>
                        </div>
                    </div>
                </el-card>

                <el-card shadow="never" class="mt-4">
                    <template #header>
                        <div class="font-bold">绑定邮箱</div>
                    </template>

                    <div class="space-y-3">
                        <div class="text-sm text-slate-500">绑定邮箱后可使用邮箱登录</div>
                        <div class="flex w-full gap-3">
                            <el-input v-model="bindEmailForm.email" placeholder="请输入邮箱" size="default" class="flex-1" />
                            <el-button size="default" :disabled="emailCodeSending || emailCountdown > 0" @click="handleSendBindEmailCode"
                                :class="emailCountdown > 0 ? '' : ''">
                                <template v-if="emailCountdown > 0">{{ emailCountdown }}s</template>
                                <template v-else-if="emailCodeSending">发送中...</template>
                                <template v-else>获取验证码</template>
                            </el-button>
                        </div>
                        <div class="flex w-full gap-3">
                            <el-input v-model="bindEmailForm.code" placeholder="请输入验证码" size="default" maxlength="6" class="flex-1" />
                            <el-button type="primary" size="default" :loading="emailBinding" @click="handleBindEmail">绑定</el-button>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="16">
                <el-card shadow="never">
                    <template #header>
                        <div class="font-bold">个人信息</div>
                    </template>

                    <el-form label-width="140px" :model="form" :rules="rules" ref="formRef" status-icon>
                        <el-form-item label="用户名：" prop="name">
                            <el-input v-model="form.name" placeholder="请输入用户名" clearable />
                        </el-form-item>

                        <el-form-item label="邮箱：" prop="email">
                            <el-input v-model="form.email" placeholder="请输入邮箱" clearable />
                        </el-form-item>

                        <el-form-item label="定时任务：" prop="isTimingTask">
                            <el-switch v-model="form.isTimingTask" />
                        </el-form-item>
                        <el-form-item label="定时任务时间：" prop="timingTaskTime">
                            <div>
                                <el-time-picker format="HH:mm:ss" value-format="HH:mm:ss" v-model="form.timingTaskTime"
                                    placeholder="请选择定时任务时间" />
                                <div class="text-xs text-slate-500 mt-3">tips:只有填写邮箱并且开启定时任务，才能收到每日打卡提醒</div>
                            </div>
                        </el-form-item>

                        <el-form-item label="地址：" prop="address">
                            <el-input v-model="form.address" placeholder="请输入地址" clearable />
                        </el-form-item>

                        <el-form-item label="签名：" prop="bio">
                            <el-input v-model="form.bio" placeholder="写点什么介绍一下自己" type="textarea" :rows="4"
                                maxlength="120" show-word-limit />
                        </el-form-item>
                    </el-form>
                </el-card>

                <el-card shadow="never" class="mt-4">
                    <template #header>
                        <div class="font-bold">危险操作</div>
                    </template>

                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-bold text-slate-900">退出登录</div>
                            <div class="text-sm text-slate-500">清除本地登录状态</div>
                        </div>
                        <el-button @click="logoutHandle" type="danger" plain>
                            退出
                        </el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { ref , onMounted , useTemplateRef} from 'vue'
import type {UserUpdate} from '@en/common/user'
import type {FormItemRule,FormRules} from 'element-plus'
import avatar from '@/assets/images//avatar/1.jpg'
import { useUserStore } from '@/stores/user'
import { uploadAvatarApi } from '@/apis/user'
import { sendEmailCodeApi, bindEmailApi } from '@/apis/user'
import type { UploadFile,FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { updateUser } from '@/apis/user'
import { uploadUrl } from '@/apis'
import { useLogin } from '@/hooks/useLogin'
import { ElMessageBox } from 'element-plus'

const formRef = useTemplateRef<FormInstance>('formRef')

const userStore = useUserStore()
const previewUrl = ref<string>('')

const bindEmailForm = ref({ email: '', code: '' })
const emailCodeSending = ref(false)
const emailBinding = ref(false)
const emailCountdown = ref(0)
let emailCountdownTimer: ReturnType<typeof setInterval> | null = null

const form = ref<UserUpdate>({
    name: '',
    email: '',
    isTimingTask: false,
    timingTaskTime: '',
    address: '',
    bio: '',
    avatar: '',
})

const rules:FormRules = ({
    name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    email: [{ required: false, message: '请输入邮箱', trigger: 'blur' },
        {
            validator:(rule:FormItemRule, value: string, callback: (error?: Error) => void) => {
                if (!value && !/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*$/.test(value)) {
                    callback(new Error('请输入正确的邮箱'))
                } else {
                    callback()
                }
            },trigger:'blur'
        }
    ],
    isTimingTask: [{ required: true, message: '请选择定时任务', trigger: 'blur' , type:'boolean' }],
    timingTaskTime: [{ required: true, message: '请选择定时任务时间', trigger: 'blur' }],
})

// const formRef = ref()

const onAvatarSelect = async (file: UploadFile) => {
    const formData = new FormData()
    formData.append('file', file.raw as File) 
    const res = await uploadAvatarApi(formData)
    if (res.success && res.data) {
        form.value.avatar = res.data.databaseUrl  
        previewUrl.value = res.data.previewUrl
        console.log(res.data.databaseUrl)
    }else{
        ElMessage.error(res.message)
    }

}

const onSave= async()=>{
    await formRef.value?.validate()
    const res = await updateUser(form.value)
    if (res.success && res.data) {
        userStore.updateUser(res.data)
        ElMessage.success('更新成功')
    }else{
        ElMessage.error(res.message)
    }
}
const handleSendBindEmailCode = async () => {
    if (!bindEmailForm.value.email) {
        ElMessage.warning('请输入邮箱')
        return
    }
    emailCodeSending.value = true
    try {
        const res = await sendEmailCodeApi(bindEmailForm.value.email)
        if (res.success) {
            ElMessage.success('验证码已发送')
            emailCountdown.value = 60
            emailCountdownTimer = setInterval(() => {
                emailCountdown.value--
                if (emailCountdown.value <= 0) {
                    if (emailCountdownTimer) clearInterval(emailCountdownTimer)
                    emailCountdownTimer = null
                }
            }, 1000)
        } else {
            ElMessage.error(res.message || '发送失败')
        }
    } catch (err: any) {
        ElMessage.error(err?.response?.data?.message || '发送失败')
    } finally {
        emailCodeSending.value = false
    }
}
const handleBindEmail = async () => {
    if (!bindEmailForm.value.email || !bindEmailForm.value.code) {
        ElMessage.warning('请填写邮箱和验证码')
        return
    }
    emailBinding.value = true
    try {
        const res = await bindEmailApi({ email: bindEmailForm.value.email, code: bindEmailForm.value.code })
        if (res.success) {
            ElMessage.success('邮箱绑定成功')
            bindEmailForm.value = { email: '', code: '' }
            init()
        } else {
            ElMessage.error(res.message || '绑定失败')
        }
    } catch (err: any) {
        ElMessage.error(err?.response?.data?.message || '绑定失败')
    } finally {
        emailBinding.value = false
    }
}
const logoutHandle = ()=>{
    ElMessageBox.confirm('确定退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        useLogin().logout()
    })
}

const init=()=>{
    if(userStore.getUser){
        form.value = {...userStore.getUpdateUserInfo}
        previewUrl.value = uploadUrl + form.value.avatar
    }
}

onMounted(()=>{
    init()
    
    
})

</script>