<script setup lang="ts">
import {ref, onMounted, onUnmounted} from "vue"
import Menu from "@/components/Menu.vue"
import {Top} from '@element-plus/icons-vue'
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
    buyDate: "",
    completeDate: "",
    memo: "",
    rate: 3,
    genre: 1,
    info: ""
})
// 登録コンポーネントへ渡す更新フラグ
const paramEditFlg = ref<boolean>(false)
// スクロールトップボタンの表示フラグ
const showScrollTop = ref<boolean>(false)
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
    paramTargetBook.value.buyDate = selectedBook.buyDate
    paramTargetBook.value.completeDate = selectedBook.completeDate
    paramTargetBook.value.memo = selectedBook.memo
    paramTargetBook.value.rate = selectedBook.rate
    paramTargetBook.value.genre = selectedBook.genre.id
    paramTargetBook.value.info = selectedBook.infoUrl
    // 更新状態とする
    paramEditFlg.value = true
    // スマートフォン表示時は編集画面にスクロール
    scrollToEditOnMobile()
}
// スマートフォン表示時に編集画面へスクロールする
const scrollToEditOnMobile = (): void => {
    // 画面幅が767px以下（スマートフォン）の場合のみスクロール
    if (window.innerWidth <= 767) {
        // 少し遅延させてDOMの更新を待つ
        setTimeout(() => {
            const rightPart = document.getElementById('rightPart')
            if (rightPart) {
                rightPart.scrollIntoView({
                    behavior: 'smooth',  // スムーズにスクロール
                    block: 'start'       // 要素の上端に合わせる
                })
            }
        }, 100)
    }
}
// スクロール位置を監視
const handleScroll = (): void => {
    showScrollTop.value = window.scrollY > 200
}
// ページトップへスクロール
const scrollToTop = (): void => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
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
    paramTargetBook.value.buyDate = ""
    paramTargetBook.value.completeDate = ""
    paramTargetBook.value.memo = ""
    paramTargetBook.value.rate = 3
    paramTargetBook.value.genre = 1
    paramTargetBook.value.info = ""
}
// 更新中フラグをセットする
const setEditFlg = (flg: boolean) => {
    console.log("Top.setEditFlg", flg)
    paramEditFlg.value = flg
}

// スクロール監視
onMounted(() => {
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
    <!-- メニューアイコンを浮かせる -->
    <div id="userIcon">
        <Menu/>
    </div>
    <el-row :gutter="20" class="main-content">
        <!-- 画面の左側（検索部分） -->
        <el-col
            :xs="24"
            :sm="24"
            :md="12"
            :lg="12"
            id="leftPart"
        >
            <BookSearch v-on:rowClick="rowClick" ref="bookSearchComponent"/>
        </el-col>
        <!-- 画面の右側（編集部分） -->
        <el-col
            :xs="24"
            :sm="24"
            :md="12"
            :lg="12"
            id="rightPart"
        >
            <BookEdit
                v-bind:targetBook="paramTargetBook"
                v-bind:paramEditFlg="paramEditFlg"
                v-on:research="research"
                v-on:resetRow="resetRow"
                v-on:resetProps="resetProps"
                v-on:setEditFlg="setEditFlg"
            />
        </el-col>
    </el-row>

    <!-- トップへ戻るボタン -->
    <transition name="fade">
        <div
            v-show="showScrollTop"
            id="scrollTopButton"
            @click="scrollToTop"
            title="トップへ戻る"
        >
            <el-icon :size="24">
                <Top />
            </el-icon>
        </div>
    </transition>
</template>

<style scoped>
.main-content {
  padding: 0 10px;
}

#leftPart, #rightPart {
  margin: 0;
  padding: 10px;
  min-height: 400px;
}

#userIcon {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

/* タブレット以上のサイズ */
@media (min-width: 768px) {
  .main-content {
    padding: 0 20px;
  }

  #leftPart, #rightPart {
    height: 70vh;
    padding: 20px;
  }
}

/* PC以上のサイズ */
@media (min-width: 992px) {
  #leftPart, #rightPart {
    height: 75vh;
  }
}

/* スマートフォン縦向き */
@media (max-width: 767px) {
  #leftPart {
    margin-bottom: 200px;
    min-height: auto;
  }

  #rightPart {
    margin-top: 200px;
    border-top: 1px dotted #000;
    padding-top: 30px;
  }
}

#scrollTopButton {
    position: fixed;
    right: 20px;
    bottom: 40px;
    width: 50px;
    height: 50px;
    background-color: #409eff;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
    z-index: 999;
    transition: all 0.3s;
    display: none;  /* デフォルトは非表示 */
}

#scrollTopButton:hover {
    background-color: #66b1ff;
    transform: translateY(-3px);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.4);
}

#scrollTopButton:active {
    transform: translateY(-1px);
}

/* フェードアニメーション */
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

/* スマートフォンサイズの時だけ表示 */
@media (max-width: 767px) {
    #scrollTopButton {
        display: flex;  /* スマートフォンで表示 */
    }
}
</style>