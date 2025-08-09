<script setup lang="ts">
import {ref, reactive, onMounted} from "vue"
import type {UserType} from "@/interfaces"
import Constant from "@/constant"
import axios from "@/axios"
import { ElMessage } from 'element-plus'
import {Search, Edit, Delete, Plus, InfoFilled} from '@element-plus/icons-vue'
import type {FormInstance, FormRules, TableInstance } from "element-plus"


// ユーザ一覧
const userList = ref<UserType[]>([])
const userListRef = ref<TableInstance>()
// 登録項目
const userRegistForm = reactive({
    id: "",
    name: "",
    role: "",
})
// バリデーション設定
interface RuleForm {
    id: string
    name: string
    role: string
}
const userFormRef = ref<FormInstance>()
const rules = reactive<FormRules<RuleForm>>({
    id: [
        {required: true, message: "IDが未入力です。", trigger: "blur"},
        {pattern: /^[0-9a-zA-Z]+$/, message: '英数字を入力してください。', trigger: 'blur'}
    ],
    name: [
        {required: true, message: "氏名が未入力です。", trigger: "blur"}
    ],
    role: [
        {required: true, message: "権限が未入力です。", trigger: "blur"}
    ]
})
// 更新フラグ
const editFlg = ref<boolean>(false)
// 検索結果テーブルのローディングフラグ
const tableLoadFlg = ref<boolean>(false)
// 登録処理のローディングフラグ
const registLoadFlg = ref<boolean>(false)
// 削除処理のローディングフラグ
const deleteLoadFlg = ref<boolean>(false)

// ユーザ一覧取得
const searchUser = () => {
    tableLoadFlg.value = true
    axios.post<UserType[]>(Constant.URL_USER_GETLIST).then((res) => {
        userList.value = res.data
    }).finally(() => {
        tableLoadFlg.value = false
    })
}
// ユーザ一覧の権限の表記
const formatRoleName = (row: any, column: any, cellValue: string, index: number): string => {
    let dispRoleName = ""
    switch(cellValue) {
        case "ADMIN":
            dispRoleName = "管理"
            break
        case "USER":
            dispRoleName = "一般"
            break
        default:
            break
    }
    return dispRoleName
}
// 一覧の行をクリック
const rowClick = (row: UserType) => {
    userRegistForm.id = row.id
    userRegistForm.name = row.name
    userRegistForm.role = row.roleName
    // 更新フラグをオン
    editFlg.value = true
}
// ユーザ登録
const registUser = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
        if (valid) {
            registLoadFlg.value = true
            const user: UserType = {
                id: userRegistForm.id,
                password: "",
                name: userRegistForm.name,
                roleName: userRegistForm.role,
                token: "",
            }
            axios.post(Constant.URL_USER_REGIST, user).then(() => {
                ElMessage({
                showClose: true,
                message: '登録が完了しました。',
                type: 'success',
                })
                // 再検索処理
                searchUser()
            }).finally(() => {
                registLoadFlg.value = false
            })
        } else {
            ElMessage({
                showClose: true,
                message: '登録が失敗しました。',
                type: 'success',
            })
        }
    })
}
// クリア処理
const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    // ユーザ一覧の選択状態を解除する。
    userListRef.value!.setCurrentRow(null)
    // 編集中フラグをオフ
    editFlg.value = false
}
// ユーザ削除
const deleteBook = () => {
    deleteLoadFlg.value = true
    axios.post<string>(Constant.URL_USER_DELETE + userRegistForm.id).then((res) => {
        if (res.data == "0") {
            // 使用されているため削除不可
            ElMessage({
                showClose: true,
                message: '使用中のため削除できません。',
                type: 'error',
            })
        } else if (res.data == "1") {
            // 削除完了
            ElMessage({
                showClose: true,
                message: '削除が完了しました。',
                type: 'success',
            })
            // フォームをリセットする。
            resetForm(userFormRef.value)
            // 再検索する
            searchUser()
        } else {
            ElMessage({
                showClose: true,
                message: '削除できませんでした。',
                type: 'error',
            })
        }
    }).catch((error) => {
        console.log("削除失敗", error.response)
        ElMessage({
            showClose: true,
            message: '削除が失敗しました。',
            type: 'error',
        })
    }).finally(() => {
        deleteLoadFlg.value = false
    })
}
// 初期処理
onMounted(() => {
    searchUser()
})
</script>

<template>
    <el-row>
        <!-- 画面の左側 -->
        <el-col v-bind:span="12" id="leftPart">
            <!-- ユーザ一覧 -->
            <el-table
                border
                ref="userListRef"
                v-bind:data="userList"
                highlight-current-row
                stripe
                v-on:current-change = "rowClick"
                v-loading="tableLoadFlg"
            >
                <el-table-column prop="id" label="ID"/>
                <el-table-column prop="name" label="氏名"/>
                <el-table-column prop="roleName" label="権限" v-bind:formatter="formatRoleName"/>
            </el-table>
        </el-col>
        <!-- 画面の右側 -->
        <el-col v-bind:span="12" id="rightPart">
            <!-- ユーザ登録フォーム -->
            <el-form v-bind:model="userRegistForm" ref="userFormRef" v-bind:rules="rules">
                <el-form-item prop="id">
                    <el-input type="text" v-model="userRegistForm.id" v-bind:disabled="editFlg" placeholder="ID"/>
                </el-form-item>
                <el-form-item prop="name">
                    <el-input type="text" v-model="userRegistForm.name" placeholder="氏名"/>
                </el-form-item>
                <el-form-item prop="role">
                    <el-select v-model="userRegistForm.role" placeholder="権限">
                        <el-option label="一般" value="USER" key="USER"/>
                        <el-option label="管理" value="ADMIN" key="ADMIN"/>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary"
                        v-bind:icon="Edit"
                        v-bind:loading="registLoadFlg"
                        v-on:click="registUser(userFormRef)"
                    >
                    登録
                    </el-button>
                    <el-popconfirm
                        confirmButtonText="はい"
                        cancelButtonText="いいえ"
                        title="入力中の内容は破棄されますがよろしいですか？"
                        iconColor="red"
                        v-on:confirm="resetForm(userFormRef)"
                    >
                        <template #reference>
                            <el-button type="info">クリア</el-button>
                        </template>
                    </el-popconfirm>
                    <el-popconfirm
                        confirmButtonText="はい"
                        cancelButtonText="いいえ"
                        title="削除してよろしいですか？"
                        iconColor="red"
                        v-on:confirm="deleteBook"
                    >
                        <template #reference>
                        <el-button type="danger" v-bind:icon="Delete" v-bind:loading="deleteLoadFlg" v-bind:disabled="!editFlg">削除</el-button>
                        </template>
                    </el-popconfirm>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<style scoped>
#leftPart, #rightPart {
  margin: 0;
  padding: 0;
  height: 70vh;
  padding-top: 40px;
  padding-left: 20px;
  padding-right: 20px;
}
</style>