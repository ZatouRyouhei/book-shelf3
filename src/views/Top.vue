<script setup lang="ts">
import {ref} from "vue"
import Menu from "@/components/Menu.vue"
import BookSearch from "@/components/BookSearch.vue";
import BookEdit from "@/components/BookEdit.vue";
import type {BookType, BookFormType } from '@/interfaces';

const bookSearchComponent = ref()

// 登録フォームへ渡す本情報
const paramTargetBook = ref<BookFormType>({
    seqNo: 0,
    image: "",
    title: "",
    price: 0,
    author: "",
    publisher: "",
    published: "",
    completeDate: "",
    memo: "",
    rate: 3,
    genre: 1,
    info: ""
})
// 登録コンポーネントへ渡す更新フラグ
const paramEditFlg = ref<boolean>(false)
// 検索結果の行をクリックしたときの処理
const rowClick = (selectedBook: BookType): void => {
    // 選択された本情報を登録フォームにセットする。
    paramTargetBook.value.seqNo = selectedBook.seqNo
    paramTargetBook.value.image = selectedBook.imgUrl
    paramTargetBook.value.title = selectedBook.title
    paramTargetBook.value.price = selectedBook.price
    paramTargetBook.value.author = selectedBook.author
    paramTargetBook.value.publisher = selectedBook.publisher
    paramTargetBook.value.published = selectedBook.published
    paramTargetBook.value.completeDate = selectedBook.completeDate
    paramTargetBook.value.memo = selectedBook.memo
    paramTargetBook.value.rate = selectedBook.rate
    paramTargetBook.value.genre = selectedBook.genre.id
    paramTargetBook.value.info = selectedBook.infoUrl
    // 更新状態とする
    paramEditFlg.value = true
}
// 登録された時の処理
const research = () => {
    // 再検索を行う
    bookSearchComponent.value.bookSearch()
}
// 入力欄がクリアされた時の処理
const resetRow = () => {
    bookSearchComponent.value.resetRow()
}
// プロパティをリセット
const resetProps = () => {
    paramTargetBook.value.seqNo = 0
    paramTargetBook.value.image = ""
    paramTargetBook.value.title = ""
    paramTargetBook.value.price = 0
    paramTargetBook.value.author = ""
    paramTargetBook.value.publisher = ""
    paramTargetBook.value.published = ""
    paramTargetBook.value.completeDate = ""
    paramTargetBook.value.memo = ""
    paramTargetBook.value.rate = 3
    paramTargetBook.value.genre = 1
    paramTargetBook.value.info = ""
    paramEditFlg.value = false
}
</script>

<template>
    <el-row>
        <el-col v-bind:span="24" id="userIcon">
            <!-- メニュー -->
            <Menu/>
        </el-col>
    </el-row>
    <el-row>
        <!-- 画面の左側 -->
        <el-col :span="12" id="leftPart">
            <BookSearch v-on:rowClick="rowClick" ref="bookSearchComponent"/>
        </el-col>
        <!-- 画面の右側 -->
        <el-col :span="12" id="rightPart">
            <BookEdit
                v-bind:targetBook="paramTargetBook"
                v-bind:paramEditFlg="paramEditFlg"
                v-on:research="research"
                v-on:resetRow="resetRow"
                v-on:resetProps="resetProps"/>
        </el-col>
    </el-row>
</template>

<style scoped>
#leftPart, #rightPart {
  margin: 0;
  padding: 0;
  height: 70vh;
  padding-left: 20px;
  padding-right: 20px;
}
#userIcon {
  text-align: right;
}
</style>