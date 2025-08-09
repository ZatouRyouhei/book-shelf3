<script setup lang="ts">
import {ref, reactive, onMounted, watch} from "vue"
import type { BookType, BookFormType, GenreType, GoogleBookType } from '@/interfaces';
import axios from "@/axios"
import Constant from "@/constant"
import {useUserStore} from "@/stores/user"
import {Edit, Delete, Plus, InfoFilled} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type {FormInstance, FormRules } from "element-plus"
import GoogleSearchDialog from "@/components/GoogleSearchDialog.vue"

// store設定
const userStore = useUserStore()
// Props設定
interface Props {
    targetBook: BookFormType
    paramEditFlg: boolean
}
const props = defineProps<Props>()
// emit設定
interface Emits {
    (event: "research"): void
    (event: "resetRow"): void
    (event: "resetProps"): void
}
const emit = defineEmits<Emits>()
// プルダウン用ジャンル一覧
const genreList = ref<GenreType[]>([])
// 更新中のフラグ　検索結果の行をクリックしたときにtrue
const editFlg = ref<boolean>(props.paramEditFlg)
// 登録項目
const bookRegistForm = reactive({
    seqNo: props.targetBook.seqNo,
    image: props.targetBook.image,
    title: props.targetBook.title,
    price: props.targetBook.price,
    author: props.targetBook.author,
    publisher: props.targetBook.publisher,
    published: props.targetBook.published,
    completeDate: props.targetBook.completeDate,
    memo: props.targetBook.memo,
    rate: props.targetBook.rate,
    genre: props.targetBook.genre,
    info: props.targetBook.info
})
// 検索結果の行がクリックされたことを検知してフォームに値を設定する。
watch([props.targetBook, props.paramEditFlg], () => {
    bookRegistForm.seqNo = props.targetBook.seqNo
    bookRegistForm.image = props.targetBook.image
    bookRegistForm.title = props.targetBook.title
    bookRegistForm.price = props.targetBook.price
    bookRegistForm.author = props.targetBook.author
    bookRegistForm.publisher = props.targetBook.publisher
    bookRegistForm.published = props.targetBook.published
    bookRegistForm.completeDate = props.targetBook.completeDate
    bookRegistForm.memo = props.targetBook.memo
    bookRegistForm.rate = props.targetBook.rate
    bookRegistForm.genre = props.targetBook.genre
    bookRegistForm.info = props.targetBook.info
    editFlg.value = props.paramEditFlg
})
// バリデーション設定
interface RuleForm {
    title: string
    author: string
    price: number
    publisher: string
    published: string
    completeDate: string
    genre: number
    rate: number
    memo: string
}
const ruleFormRef = ref<FormInstance>()
const rules = reactive<FormRules<RuleForm>>({
    title: [
        {required: true, message: "タイトルが未入力です。", trigger: "blur"}
    ],
    price: [
        {required: true, message: '値段が未入力です。', trigger: 'blur'}
    ],
    author: [
        {required: true, message: '著者が未入力です。', trigger: 'blur'}
    ],
    publisher: [
        {required: true, message: '出版社が未入力です。', trigger: 'blur'}
    ],
    published: [
        {required: true, message: '発売日が未入力です。', trigger: 'blur'}
    ],
    rate: [
        {required: true, message: '評価が未入力です。', trigger: 'blur'}
    ],
    genre: [
        {required: true, message: 'ジャンルが未入力です。', trigger: 'blur'}
    ]
})
// 登録処理のローディングフラグ
const registLoadFlg = ref<boolean>(false)
// 削除処理のローディングフラグ
const deleteLoadFlg = ref<boolean>(false)
// google検索のダイアログ表示用のフラグ
const dialogVisible = ref(false)

// 登録処理
const registBook = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
        if (valid) {
            // 登録処理開始
            registLoadFlg.value = true
            const book: BookType = {
                userId: userStore.id,
                seqNo: bookRegistForm.seqNo,
                title: bookRegistForm.title,
                price: bookRegistForm.price,
                author: bookRegistForm.author,
                publisher: bookRegistForm.publisher,
                published: bookRegistForm.published,
                completeDate: bookRegistForm.completeDate,
                memo: bookRegistForm.memo,
                rate: bookRegistForm.rate,
                genre: {
                id: bookRegistForm.genre,
                name: ""
                },
                imgUrl: bookRegistForm.image,
                infoUrl: bookRegistForm.info
            }
            axios.post<number>(Constant.URL_BOOK_REGIST, book).then((res) => {
                bookRegistForm.seqNo = res.data
                ElMessage({
                showClose: true,
                message: '登録が完了しました。',
                type: 'success',
                })
                // 編集中フラグをオン
                editFlg.value = true
                // 再検索を行うために親コンポーネントにイベントを送信
                emit("research")
            }).catch((error) => {
                console.log("登録失敗", error.response)
                ElMessage({
                    showClose: true,
                    message: '登録が失敗しました。',
                    type: 'error',
                })
            }).finally(() => {
                registLoadFlg.value = false
            })
        } else {
            ElMessage({
                showClose: true,
                message: '登録が失敗しました。',
                type: 'error',
            })
        }
    })
}
// 入力フォームをリセットする処理
const resetForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.resetFields()
    // 行の選択状態をリセットする
    emit("resetRow")
    // propsをクリアする。クリアしないと次に同じ行をクリックしたときに反応しなくなる。
    emit("resetProps")
}
// 削除する処理
const deleteBook = () => {
    // 削除処理開始
    deleteLoadFlg.value = true
    axios.post(Constant.URL_BOOK_DELETE + userStore.id + "/" + bookRegistForm.seqNo).then(() => {
        ElMessage({
            showClose: true,
            message: '削除が完了しました。',
            type: 'success',
        })
        // 再検索を行うために親コンポーネントにイベントを送信
        emit("research")
        // フォームをリセットする。
        resetForm(ruleFormRef.value)
    }).finally(() => {
        // 削除処理完了
        deleteLoadFlg.value = false
    })
}
// google検索結果の行をクリックしたときの処理
const bookClick = (book: GoogleBookType): void => {
    console.log(book)
    // 一旦フォームをリセットする
    resetForm(ruleFormRef.value)
    // フォームに結果をセットする
    bookRegistForm.seqNo = 0
    bookRegistForm.image = book.image
    bookRegistForm.title = book.title
    bookRegistForm.author = book.author
    if (book.price == "-") {
        bookRegistForm.price = 0
    } else {
        bookRegistForm.price = parseInt(book.price)
    }
    bookRegistForm.publisher = book.publisher
    if (book.published) {
        const publishedArr = book.published.split("-")
        if (publishedArr.length == 3) {
        bookRegistForm.published = book.published
        } else if (publishedArr.length == 2) {
        bookRegistForm.published = publishedArr[0] + "-" + publishedArr[1] + "-" + "01"
        } else if (publishedArr.length == 1) {
        bookRegistForm.published = publishedArr[0] + "-" + "01" + "-" + "01"
        } else {
        bookRegistForm.published = ""
        }
    } else {
        bookRegistForm.published = ""
    }
    bookRegistForm.info = book.info
}
// Google検索ダイアログを閉じたときの処理
const closeDialog = () => {
    dialogVisible.value = false
}

// 初期処理
onMounted(() => {
    //ジャンル一覧取得
    axios.get<GenreType[]>(Constant.URL_GENRE_GETLIST).then((res) => {
        genreList.value = res.data
    })
})
</script>

<template>
    <!--登録フォーム-->
    <el-form v-bind:model="bookRegistForm" ref="ruleFormRef" v-bind:rules="rules">
        <div class="titleImg">
            <img v-bind:src="bookRegistForm.image">
            <el-link
                class="infoLink"
                v-bind:underline="false"
                type="success"
                v-bind:href="bookRegistForm.info"
                target="_blank"
                v-bind:icon="InfoFilled"
            >
                詳細
            </el-link>
            <!-- google検索ダイアログ表示ボタン -->
            <el-button type="success" class="dialogButton" :icon="Plus" circle v-on:click="dialogVisible=true" v-bind:disabled="editFlg"/>
        </div>
        <el-form-item prop="image">
            <el-input type="hidden" v-model="bookRegistForm.image"/>
        </el-form-item>
        <el-form-item prop="info">
            <el-input type="hidden" v-model="bookRegistForm.info"/>
        </el-form-item>
        <el-form-item prop="seqNo">
            <el-input type="hidden" v-model="bookRegistForm.seqNo"/>
        </el-form-item>
        <el-form-item label="タイトル" size="small" prop="title">
            <el-input v-model="bookRegistForm.title"/>
        </el-form-item>
        <el-form-item label="著者" size="small" prop="author">
            <el-input v-model="bookRegistForm.author"/>
        </el-form-item>
        <el-form-item label="値段（税込）" size="small" prop="price">
            <el-input-number
                controls-position="right"
                v-model="bookRegistForm.price"
                v-bind:precision="0"
                v-bind:step="1"
                v-bind:min="0"
                v-bind:max="100000"
            >
                <template #prefix>
                    <span>￥</span>
                </template>
            </el-input-number>
        </el-form-item>
        <el-form-item label="出版社" size="small" prop="publisher">
            <el-input v-model="bookRegistForm.publisher"/>
        </el-form-item>
        <el-form-item label="発売日" size="small" prop="published">
            <el-date-picker
                v-model="bookRegistForm.published"
                type="date"
                format="YYYY年M月D日"
                value-format="YYYY-MM-DD"
            />
        </el-form-item>
        <el-form-item label="読了日" size="small" prop="completeDate">
            <el-date-picker
                v-model="bookRegistForm.completeDate"
                type="date"
                format="YYYY年M月D日"
                value-format="YYYY-MM-DD"
            />
        </el-form-item>
        <el-form-item label="ジャンル" prop="genre">
            <el-select size="small" v-model="bookRegistForm.genre" placeholder="ジャンル">
                <el-option
                    v-for="item in genreList"
                    v-bind:key="item.id"
                    v-bind:label="item.name"
                    v-bind:value="item.id"
                />
            </el-select>
        </el-form-item>
        <el-form-item label="評価" prop="rate">
            <el-rate
                v-model="bookRegistForm.rate"
                v-bind:colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                v-bind:texts="['面白くない', 'あまり面白くない', '普通', '面白い', 'とても面白い']"
                show-text
            />
        </el-form-item>
        <el-form-item label="感想" prop="memo">
            <el-input type="textarea" v-bind:row="4" v-model="bookRegistForm.memo"/>
        </el-form-item>
        <el-form-item>
            <el-button type="primary"
                v-bind:icon="Edit"
                v-bind:loading="registLoadFlg"
                v-on:click="registBook(ruleFormRef)"
            >
                登録
            </el-button>
            <el-popconfirm
                confirmButtonText="はい"
                cancelButtonText="いいえ"
                title="入力中の内容は破棄されますがよろしいですか？"
                iconColor="red"
                v-on:confirm="resetForm(ruleFormRef)"
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

    <!-- google検索のダイアログ -->
    <GoogleSearchDialog
        v-bind:dialogVisible="dialogVisible"
        v-on:bookClick="bookClick"
        v-on:closeDialog="closeDialog"
    />
</template>

<style scoped>
.titleImg {
  width: 200px;
  height: 210px;
  position: relative;
}
img {
  position: absolute;
  top:  0;                     /* 位置指定 */
  left:  0;                    /* 位置指定 */
}
.infoLink {
  position: absolute;
  bottom:  0;                  /* 位置指定 */
  left:  0;                    /* 位置指定 */
}
.dialogButton {
  position: absolute;
  top:  0;                    /* 位置指定 */
  right:  0;                  /* 位置指定 */
}
</style>