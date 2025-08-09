<script setup lang="ts">
import {reactive, ref} from "vue"
import type {FormInstance, FormRules} from "element-plus"
import {SwitchButton} from '@element-plus/icons-vue'
import axios from "axios"
import type {UserType} from "@/interfaces"
import Constant from "@/constant"
import sha512 from 'js-sha512'
import {useUserStore} from "@/stores/user"
import {useRouter} from "vue-router"
import { ElMessage } from 'element-plus'

// vue router設定
const router = useRouter()
// store設定
const userStore = useUserStore()
// 入力項目
const form = reactive({
    userId: "",
    password: ""
})
// バリデーション設定
interface RuleForm {
    userId: string
    password: string
}
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<RuleForm>>({
    userId: [
        {required: true, message: "IDが未入力です。", trigger: "blur"}
    ],
    password: [
        {required: true, message: "パスワードが未入力です。", trigger: "blur"}
    ]
})
// ログインフラグ（ログイン処理中にtrue）
const loginFlg = ref<boolean>(false)

// ログイン処理
const onSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid, fields) => {
        if (valid) {
            // ログイン処理開始
            loginFlg.value = true
            const loginObj: UserType = {
                id: form.userId,
                password: sha512.sha512(form.password),
                name: "",
                roleName: "",
                token: "",
            }
            axios.post<UserType>(Constant.URL_USER_LOGIN, loginObj).then((res) => {
                userStore.setUserStore(res.data)
                router.push({name: "about"})
            }).catch((error) => {
                console.log("ログイン失敗1", error.response)
                ElMessage({
                    showClose: true,
                    message: 'ログインに失敗しました。',
                    type: 'error',
                })
            }).finally(() => {
                // ログイン処理終了
                loginFlg.value = false
            })
        } else {
            console.log("ログイン失敗2", fields)
        }
    })
}
</script>

<template>
    <div class="container">
        <div class="home">
            <el-form
                v-bind:model="form"
                ref="ruleFormRef"
                v-bind:rules="rules"
            >
                <el-form-item prop="userId">
                    <el-input v-model="form.userId" placeholder="ID" size="large"/>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        v-model="form.password"
                        type="password"
                        size="large"
                        show-password
                        placeholder="パスワード"
                        v-on:keyup.enter.native="onSubmit(ruleFormRef)"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary"
                        v-on:click="onSubmit(ruleFormRef)"
                        v-bind:icon="SwitchButton"
                        v-bind:loading="loginFlg"
                    >
                        ログイン
                    </el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<style scoped>
.container {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    height: 100vh;
    width: 100vw;
    background: url('../assets/logo.png') 20% 20% no-repeat;
    background-size: 400px 400px;
}
.home {
    position: absolute;
    width: 20%;
    top: 30%;
    left: 38%;
}
</style>