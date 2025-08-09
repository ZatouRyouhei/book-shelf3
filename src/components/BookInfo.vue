<script setup lang="ts">
import type {GoogleBookType} from "@/interfaces"
// Props設定
interface Props {
    index: number,
    linkable: boolean,
    book: GoogleBookType,
}
const props = defineProps<Props>()
// Emits設定
interface Emits {
    (event: "book-click", book: GoogleBookType): void
}
const emit = defineEmits<Emits>()

// 行をクリックしたときの処理
const onClick = () => {
    if (props.linkable) {
        emit("book-click", props.book)
    }
}
</script>

<template>
    <div v-bind:class="{linkable: linkable}" v-on:click="onClick">
        <el-row>
            <el-col>
                <div class="image">
                    <img v-bind:src="book.image"/>
                </div>
            </el-col>
            <el-col>
                <div class="details">
                    <ul>
                        <li v-if="index">{{ index }}</li>
                        <li>{{ book.title }}（{{book.price}} 円）</li>
                        <li>{{ book.author }} 著</li>
                        <li>{{ book.publisher }} /刊</li>
                        <li>{{ book.published }} /発売</li>
                    </ul>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<style scoped>
.linkable:hover {
  cursor: pointer;
  background-color: #ff9;
}
ul {
  list-style-type: none;
}
li {
  padding-top: 0;
  padding-bottom: 0;
  line-height: 2em;
}
</style>