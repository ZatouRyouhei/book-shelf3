<script setup lang="ts">
import structureImage from "../assets/book-shelf.drawio.svg"

// Props設定
interface Props {
    structureDialogVisible: boolean
}
defineProps<Props>()

// emit設定
interface Emits {
    (event: "closeDialog"): void
}
const emit = defineEmits<Emits>()

// ダイアログをクローズしたときの処理
const onClose = () => {
    emit("closeDialog")
}
</script>

<template>
    <el-dialog
        title="システム構成"
        v-bind:model-value="structureDialogVisible"
        v-on:close="onClose"
        width="60%"
        center>
        <img v-bind:src="structureImage" alt="システム構成図" style="width: 100%; height: auto;" />
    </el-dialog>
</template>