<script setup lang="ts">
import {ref, computed} from "vue"
import {UserFilled} from '@element-plus/icons-vue'
import {useUserStore} from "@/stores/user"
import {useRouter, useRoute} from "vue-router"
import PasswordDialog from "@/components/PasswordDialog.vue"

// vue router設定
const router = useRouter()
const route = useRoute()
// store設定
const userStore = useUserStore()
// パスワードダイアログのオープンフラグ
const passwordDialogFlg = ref<boolean>(false)
// 現在のパスを取得
const currentPath = computed(
    (): string => {
        return route.path
    }
)
// ログアウト処理
const logout = () => {
    userStore.clearUserStore()
    router.push({name: "home"})
}
// パスワード変更ダイアログをオープン
const passwordDialogOpen = () => {
    passwordDialogFlg.value = true
}
// パスワード変更ダイアログをクローズ
const passwordDialogClose = () => {
    passwordDialogFlg.value = false
}
// トップ画面へ遷移
const toTop = () => {
    router.push({name: "about"})
}
// 管理画面へ遷移
const toAdmin = () => {
    router.push({name: "admin"})
}
</script>

<template>
    <el-dropdown>
        <el-avatar v-bind:icon="UserFilled" />
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item disabled>{{ userStore.name }} さん</el-dropdown-item>
                <el-dropdown-item divided v-on:click="passwordDialogOpen">パスワード変更</el-dropdown-item>
                <el-dropdown-item v-if="userStore.roleName == 'ADMIN' && !currentPath.startsWith('/admin')" v-on:click="toAdmin">管理</el-dropdown-item>
                <el-dropdown-item v-if="currentPath != '/about'" v-on:click="toTop">トップ</el-dropdown-item>
                <el-dropdown-item v-on:click="logout">ログアウト</el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>

    <!-- パスワード変更ダイアログ -->
    <PasswordDialog v-bind:passwordDialogVisible="passwordDialogFlg" v-on:closeDialog="passwordDialogClose"/>
</template>