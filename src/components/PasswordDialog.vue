<script setup lang="ts">
import {reactive, ref} from "vue"
import {Edit} from '@element-plus/icons-vue'
import type {UserType} from "@/interfaces"
import axios from "@/axios"
import {useUserStore} from "@/stores/user"
import Constant from "@/constant"
import { ElMessage } from 'element-plus'
import type {FormInstance, FormRules} from "element-plus"
import sha512 from 'js-sha512'

// store設定
const userStore = useUserStore()
// Props設定
interface Props {
    passwordDialogVisible: boolean
}
defineProps<Props>()

// emit設定
interface Emits {
    (event: "closeDialog"): void
}
const emit = defineEmits<Emits>()
// 入力フォーム
const passwordForm = reactive({
    newPassword: "",
    newPasswordConfirm: ""
})
// バリデーション設定
interface RuleForm {
    newPassword: string
    newPasswordConfirm: string
}
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<RuleForm>>({
    newPassword: [
        {required: true, message: "パスワードが未入力です。", trigger: "blur"}
    ],
    newPasswordConfirm: [
        {required: true, message: "パスワードが未入力です。", trigger: "blur"}
    ]
})

// パスワード変更処理
const changePassword = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
        if (valid) {
            if (passwordForm.newPassword != passwordForm.newPasswordConfirm) {
                ElMessage({
                    showClose: true,
                    message: 'パスワードとパスワード（確認）が異なります。',
                    type: 'error',
                })
            } else {
                const userObj: UserType = {
                    id: userStore.id,
                    password: sha512.sha512(passwordForm.newPassword),
                    name: "",
                    roleName: "",
                    mailAddress: "",
                    token: ""
                }
                axios.post(Constant.URL_USER_CHANGEPASSWORD, userObj).then(() => {
                    ElMessage({
                        showClose: true,
                        message: '登録が完了しました。',
                        type: 'success',
                    })
                }).catch((error) => {
                    console.log("登録失敗", error.response)
                    ElMessage({
                        showClose: true,
                        message: '登録が失敗しました。',
                        type: 'error',
                    })
                })
            }
        }
    })
}
// ダイアログをクローズしたときの処理
const onClose = () => {
    emit("closeDialog")
}
</script>

<template>
    <!-- ダイアログ -->
    <!-- v-model="passwordDialogVisible"とするとエラーなる。v-bind:model-value="passwordDialogVisible"とする。 -->
    <!-- props変数は読み取り専用で変更不可だが、v-modelとすると内部で変更処理が入るためと思われる。 -->
    <el-dialog
        title="パスワード変更"
        v-bind:model-value="passwordDialogVisible"
        v-on:close="onClose"
        center
    >
        <el-form v-bind:model="passwordForm" ref="ruleFormRef" v-bind:rules="rules">
            <el-form-item prop="newPassword">
                <el-input
                    type="password"
                    v-model="passwordForm.newPassword"
                    placeholder="新しいパスワード"
                    show-password
                />
            </el-form-item>
            <el-form-item prop="newPasswordConfirm">
                <el-input
                    type="password"
                    v-model="passwordForm.newPasswordConfirm"
                    placeholder="上と同じパスワードをもう一度入力してください。"
                    show-password
                />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" v-on:click="changePassword(ruleFormRef)" v-bind:icon="Edit">登録</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>