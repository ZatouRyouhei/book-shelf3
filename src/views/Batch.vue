<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type {UserType, BatchErrorType} from "@/interfaces"
import Constant from "@/constant"
import {Select, Upload} from '@element-plus/icons-vue'
import type { UploadInstance, UploadFile, UploadFiles } from 'element-plus'
import { ElMessage } from 'element-plus'
import {useUserStore} from "@/stores/user"
import axios from "@/axios"

// store設定
const userStore = useUserStore()
// ユーザ一覧
const userList = ref<UserType[]>([])
// 対象ユーザID
const targetUser = ref<string>("")
// ダイアログ
const dialogVisible = ref<boolean>(false)
// エラーリスト
const errorList = ref<BatchErrorType[]>([])
// アップロード設定
const uploadRef = ref<UploadInstance>()
const uploadUrl = ref<string>(Constant.URL_BOOK_BATCH)
const uploadHeaders = reactive({
    Authorization: 'Bearer ' + userStore.token,
    'Content-Type': 'text/csv'
});

// ユーザ一覧取得
const searchUser = () => {
    axios.post<UserType[]>(Constant.URL_USER_GETLIST).then((res) => {
        userList.value = res.data
    })
}
// ユーザ選択
const selectUser = () => {
    console.log("ユーザ選択：" + targetUser.value)
    uploadUrl.value = Constant.URL_BOOK_BATCH + targetUser.value
}
// ファイルアップロード
const submitUpload = () => {
    uploadRef.value!.submit()
}
// アップロード成功
const onSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    console.log("登録成功 : " + response)
    ElMessage({
        showClose: true,
        message: '登録が完了しました。',
        type: 'success',
    })
}
// アップロード失敗
const onError = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
    console.log("登録失敗 : " + response)
    // "UploadAjaxError: " の部分を削除して、純粋なJSON文字列にする
    const responseString = String(response)
    const jsonString = responseString.replace('UploadAjaxError: ', '');
    // JSON文字列をJavaScriptの配列オブジェクトに変換する
    const dataArray = JSON.parse(jsonString)
    errorList.value = dataArray
    console.log(errorList)
    ElMessage({
        showClose: true,
        message: '登録が失敗しました。',
        type: 'error',
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
            <el-select v-model="targetUser" placeholder="ユーザ" v-on:change="selectUser" style="width: 340px">
                <el-option
                    v-for="item in userList"
                    v-bind:key="item.id"
                    v-bind:label="item.name"
                    v-bind:value="item.id"
                />
            </el-select>
            <el-button v-on:click="dialogVisible=true">
                CSVレイアウト
            </el-button>
            <el-upload
                ref="uploadRef"
                v-bind:action="uploadUrl"
                v-bind:headers="uploadHeaders"
                v-bind:limit="1"
                v-bind:auto-upload="false"
                id="upload"
                style="width: 340px; margin-top: 20px;"
                v-bind:on-success="onSuccess"
                v-bind:on-error="onError"
            >
                <template #trigger>
                    <el-button type="primary" v-bind:icon="Select">ファイル選択</el-button>
                </template>
                <el-button class="uploadBtn" type="success" v-bind:icon="Upload" v-on:click="submitUpload">
                    アップロード
                </el-button>
            </el-upload>

            <!-- ダイアログ -->
            <el-dialog v-model="dialogVisible" title="CSVレイアウト">
                <table border="1" width="100%" id="csvlayout">
                    <tr>
                        <th width="5%">No</th>
                        <th width="15%">項目名</th>
                        <th width="80%">形式</th>
                    </tr>
                    <tr>
                        <td>1</td>
                        <td>タイトル</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>著者</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td>値段</td>
                        <td>半角数値</td>
                    </tr>
                    <tr>
                        <td>4</td>
                        <td>出版社</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>5</td>
                        <td>発売日</td>
                        <td>YYYY-MM-DD（頭0埋め）</td>
                    </tr>
                    <tr>
                        <td>6</td>
                        <td>購入日</td>
                        <td>YYYY-MM-DD（頭0埋め）</td>
                    </tr>
                    <tr>
                        <td>7</td>
                        <td>読了日</td>
                        <td>YYYY-MM-DD（頭0埋め）</td>
                    </tr>
                    <tr>
                        <td>8</td>
                        <td>ジャンル</td>
                        <td>半角数値（1:小説 2:参考書 3:教養 4:マンガ 5:その他）</td>
                    </tr>
                    <tr>
                        <td>9</td>
                        <td>評価</td>
                        <td>半角数値（1:面白くない 2:あまり面白くない 3:普通 4:面白い 5:とても面白い）</td>
                    </tr>
                    <tr>
                        <td>10</td>
                        <td>感想</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>11</td>
                        <td>画像URL</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>12</td>
                        <td>詳細URL</td>
                        <td></td>
                    </tr>
                </table>
            </el-dialog>
        </el-col>
        <!-- 画面の右側 -->
        <el-col v-bind:span="12" id="rightPart">
            <el-table v-bind:data="errorList" border>
                <el-table-column prop="lineNo" label="行数"/>
                <el-table-column prop="errorMsg" label="エラー内容"/>
            </el-table>
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
.uploadBtn {
    margin-left: 10px;
    margin-top: -5px;
}
#csvlayout {
    border: 1px solid black;
    border-collapse: collapse;
    background-color: #ffffff;
}
</style>