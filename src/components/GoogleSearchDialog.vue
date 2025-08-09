<script setup lang="ts">
import {ref, reactive} from "vue"
import type {FormInstance, FormRules } from "element-plus"
import type {  GoogleBookType } from '@/interfaces';
import {Search} from '@element-plus/icons-vue'
import BookInfo from "@/components/BookInfo.vue"
import Constant from "@/constant"
import axios from "axios"

// Props設定
interface Props {
    dialogVisible: boolean
}
defineProps<Props>()
// emit設定
interface Emits {
    (event: "bookClick", book: GoogleBookType): void
    (event: "closeDialog"): void
}
const emit = defineEmits<Emits>()
// google検索のフォーム
const googleSearchForm = reactive({
    title: ""
})
// バリデーション設定
interface RuleForm {
    title: string
}
// google検索のバリデーション設定
const googleSearchRuleRef = ref<FormInstance>()
const googleSearchRules = reactive<FormRules<RuleForm>>({
    title: [
        {required: true, message: "キーワードが未入力です。", trigger: "blur"}
    ]
})
// google検索の結果リスト
const googleBookList = ref<GoogleBookType[]>([])

// google検索
const googleSearch = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate((valid) => {
        if (valid) {
        googleBookList.value = []
        axios.get(Constant.URL_GOOGLE_SEARCH_BOOK + googleSearchForm.title).then((res) => {
            res.data.items.forEach((book: any) => {
            let authors = book.volumeInfo.authors
            let price = book.saleInfo.listPrice
            let img = book.volumeInfo.imageLinks
            googleBookList.value.push({
                id: book.id,
                title: book.volumeInfo.title,
                author: authors ? authors.join(",") : "",
                price: price ? price.amount: "-",
                publisher: book.volumeInfo.publisher,
                published: book.volumeInfo.publishedDate,
                image: img ? img.thumbnail: "",
                info: book.volumeInfo.infoLink,
            })
            })
        })
        }
    })
}
// 行をクリックしたときの処理
const bookClick = (book: GoogleBookType): void => {
    emit("bookClick", book)
}
// ダイアログをクローズしたときの処理
const onClose = () => {
    emit("closeDialog")
}
</script>

<template>
    <!-- google検索のダイアログ -->
    <el-dialog
        title="本を検索"
        v-bind:model-value="dialogVisible"
        v-on:close="onClose"
        center
    >
        <el-form v-bind:model="googleSearchForm" ref="googleSearchRuleRef" v-bind:rules="googleSearchRules">
            <el-form-item prop="title">
                <el-input placeholder="キーワード" v-model="googleSearchForm.title">
                    <template #append>
                        <el-button v-bind:icon="Search" v-on:click="googleSearch(googleSearchRuleRef)"/>
                    </template>
                </el-input>
            </el-form-item>

            <BookInfo
                v-for="(book, i) in googleBookList"
                v-bind:key="book.id"
                v-bind:index="i+1"
                v-bind:linkable="true"
                v-bind:book="book"
                v-on:book-click="bookClick"
            />
        </el-form>
    </el-dialog>
</template>