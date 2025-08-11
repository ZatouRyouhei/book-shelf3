<script setup lang="ts">
import {ref, reactive, onMounted, computed} from "vue"
import type { BookType, SearchCondType, GenreType } from '@/interfaces';
import axios from "@/axios"
import Constant from "@/constant"
import {useUserStore} from "@/stores/user"
import {Search, Download} from '@element-plus/icons-vue'
import type {TableInstance, TableColumnCtx } from "element-plus"
import { saveAs } from "file-saver"

// store設定
const userStore = useUserStore()
// emit設定
interface Emits {
    (event: "rowClick", selectedBook: BookType): void
}
const emit = defineEmits<Emits>()
// 検索条件
const bookSearchForm = reactive({
    title: "",
    author: "",
    genre: null, // 0とするとプルダウンの初期値に0と表示されるのでnullとしておく
    rate: 0,
    completeDate: "",
})
// 検索結果一覧
const searchBookList = ref<BookType[]>([])
// プルダウン用ジャンル一覧
const genreList = ref<GenreType[]>([])
// 検索結果テーブル
const searchBookListRef = ref<TableInstance>()
// 検索処理のローディングフラグ
const searchLoadFlg = ref<boolean>(false)
// 検索結果テーブルのローディングフラグ
const tableLoadFlg = ref<boolean>(false)
// 台帳Excelのダウンロードフラグ
const downloadFlg = ref<boolean>(false)
// 検索結果の1ページ当たりの件数
const pageSize = ref<number>(Constant.PAGE_SIZE)
// 検索結果の現在のページ数
const currentPage = ref<number>(1)

// 合計金額
const totalAmount = computed(
    (): string => {
        let total = 0
        searchBookList.value.forEach((book) => {
            total = total + book.price
            })
        return total.toLocaleString()
    }
)
// 該当ページのリスト
const currentPageList = computed(
    (): BookType[] => {
        return searchBookList.value.slice((currentPage.value - 1) * pageSize.value, (currentPage.value - 1) * pageSize.value + pageSize.value)
    }
)

// 検索ボタンを押したときの処理
const bookSearchClick = () => {
    searchLoadFlg.value = true
    bookSearch()
}
// 検索処理
const bookSearch = () => {
    // 検索処理開始
    tableLoadFlg.value = true
    const searchCond: SearchCondType = {
        userId: userStore.id,
        title: bookSearchForm.title,
        author: bookSearchForm.author,
        completeDateFrom: bookSearchForm.completeDate ? bookSearchForm.completeDate[0] : "", // null,undefined,0,空文字（""）はfalseとなる。
        completeDateTo: bookSearchForm.completeDate ? bookSearchForm.completeDate[1] : "",
        genre: bookSearchForm.genre ? bookSearchForm.genre : 0,
        rate: bookSearchForm.rate ? bookSearchForm.rate : 0,
    }
    axios.post<BookType[]>(Constant.URL_BOOK_SEARCH, searchCond).then((res) => {
        searchBookList.value = res.data
    }).finally(() => {
        // 検索処理終了
        tableLoadFlg.value = false
        searchLoadFlg.value = false
    })
}
const formatDate = (row: any, column: TableColumnCtx, cellValue: any, index: number) : string => {
    // yyyy-MM-ddをyyyy年MM月dd日にする。
    if (cellValue) {
        let year = cellValue.slice(0, 4)
        let month = cellValue.slice(5, 7)
        month = Number(month)
        let day = cellValue.slice(8, 10)
        day = Number(day)
        return year + "年" + month + "月" + day + "日"
    } else {
        return "-"
    }
}
// 検索結果のページを切り替えたとき
const pageChange = (page: number) => {
    currentPage.value = page
}
// 検索結果の行をクリックしたときの処理
const rowClick = (row: BookType) => {
    // 選択された本情報を親コンポーネントへ送る
    emit("rowClick", row)
}
// 行の選択状態をリセットする
const resetRow = () => {
    // 行のハイライトはリセットされるが、選択状態はリセットされない模様
    searchBookListRef.value!.setCurrentRow(null)
}
// Excel台帳出力
const downloadExcel = () => {
    downloadFlg.value = true
    const searchCond: SearchCondType = {
        userId: userStore.id,
        title: bookSearchForm.title,
        author: bookSearchForm.author,
        completeDateFrom: bookSearchForm.completeDate ? bookSearchForm.completeDate[0] : "", // null,undefined,0,空文字（""）はfalseとなる。
        completeDateTo: bookSearchForm.completeDate ? bookSearchForm.completeDate[1] : "",
        genre: bookSearchForm.genre ? bookSearchForm.genre : 0,
        rate: bookSearchForm.rate ? bookSearchForm.rate : 0,
    }
    axios.post(Constant.URL_BOOK_DOWNLOAD, searchCond, {
        responseType: "blob",
        headers: {
            "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    }).then((res) => {
        const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        saveAs(blob, "台帳.xlsx")
    }).finally(() => {
        downloadFlg.value = false
    })
}

// 初期処理
onMounted(() => {
    //ジャンル一覧取得
    axios.get<GenreType[]>(Constant.URL_GENRE_GETLIST).then((res) => {
        genreList.value = res.data
    })
    // 本情報取得
    bookSearch()
})

defineExpose({
    bookSearch,
    resetRow,
});
</script>

<template>
    <!--検索条件-->
    <el-form v-bind:model="bookSearchForm">
        <el-row v-bind:gutter="10">
        <el-col v-bind:span="6">
            <el-form-item size="small">
            <el-input type="text" v-model="bookSearchForm.title" placeholder="タイトル" clearable />
            </el-form-item>
        </el-col>
        <el-col v-bind:span="6">
            <el-form-item size="small">
            <el-input type="text" v-model="bookSearchForm.author" placeholder="著者" clearable />
            </el-form-item>
        </el-col>
        <el-col v-bind:span="12">
            <el-form-item size="small">
            <el-date-picker
                v-model="bookSearchForm.completeDate"
                type="daterange"
                range-separator="-"
                start-placeholder="読了日From"
                end-placeholder="読了日To"
                format="YYYY年M月D日"
                value-format="YYYY-MM-DD"
            />
            </el-form-item>
        </el-col>
        </el-row>
        <el-row v-bind:gutter="10">
        <el-col v-bind:span="6">
            <el-form-item>
            <el-select size="small" v-model="bookSearchForm.genre" placeholder="ジャンル" clearable>
                <el-option
                v-for="item in genreList"
                v-bind:key="item.id"
                v-bind:label="item.name"
                v-bind:value="item.id"
                />
            </el-select>
            </el-form-item>
        </el-col>
        <el-col v-bind:span="12">
            <el-form-item>
                評価：
                <el-rate
                    v-model="bookSearchForm.rate"
                    size="small"
                    v-bind:colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                    v-bind:texts="['面白くない', 'あまり面白くない', '普通', '面白い', 'とても面白い']"
                    show-text
                    clearable
                />
            </el-form-item>
        </el-col>
        <el-col v-bind:span="6">
            <el-row>
                <el-col v-bind:span="12">
                    <el-form-item>
                        <el-button type="primary" v-on:click="bookSearchClick" v-bind:icon="Search" v-bind:loading="searchLoadFlg">検索</el-button>
                    </el-form-item>
                </el-col>
                <el-col v-bind:span="12">
                    <el-form-item>
                        <el-button type="success" v-on:click="downloadExcel" v-bind:icon="Download" v-bind:loading="downloadFlg">台帳</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-col>
        </el-row>
    </el-form>

    <!--検索結果一覧-->
    <el-table
        border
        ref="searchBookListRef"
        v-bind:data="currentPageList"
        highlight-current-row
        v-on:current-change="rowClick"
        v-loading="tableLoadFlg"
        class="searchBookList"
        stripe
    >
        <el-table-column type="index" />
        <el-table-column prop="buyDate" label="購入日" v-bind:formatter="formatDate"/>
        <el-table-column prop="completeDate" label="読了日" v-bind:formatter="formatDate"/>
        <el-table-column prop="title" label="タイトル"/>
        <el-table-column prop="author" label="著者"/>
        <el-table-column prop="genre.name" label="ジャンル"/>
        <el-table-column label="評価">
        <template #default="scope">
            <el-rate v-model="scope.row.rate" disabled v-bind:colors="['#99A9BF', '#F7BA2A', '#FF9900']"></el-rate>
        </template>
        </el-table-column>
    </el-table>

    <!-- ページャと合計金額 -->
    <el-row class="pager">
        <el-col v-bind:span="12">
        <el-pagination
            background
            layout="total, prev, pager, next"
            v-bind:total="searchBookList.length"
            v-bind:page-size="pageSize"
            v-bind:current-page="currentPage"
            v-on:current-change="pageChange"
        />
        </el-col>
        <el-col v-bind:span="12" align="right">
        合計金額：<span class="totalAmount">{{totalAmount}}</span>&nbsp;円
        </el-col>
    </el-row>
</template>

<style scoped>
.totalAmount {
  font-weight: bold;
  color: red;
}
.pager {
  margin-top: 10px;
}
.searchBookList {
  margin-top: 30px;
}
</style>