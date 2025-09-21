<script setup lang="ts">
import { RouterView } from 'vue-router'
import Menu from "@/components/Menu.vue"
</script>

<template>
    <el-row>
        <el-col v-bind:span="18">
            <el-menu mode="horizontal" v-bind:router="true">
                <el-menu-item index="/admin/user">
                    ユーザ管理
                </el-menu-item>
                <el-menu-item index="/admin/batch">
                    本情報一括登録
                </el-menu-item>
            </el-menu>
        </el-col>
        <el-col v-bind:span="6" id="userIcon">
            <Menu/>
        </el-col>
    </el-row>
   
    <Transition name="fade" appear mode="out-in">
        <RouterView />
    </Transition>
</template>

<style scoped>
#userIcon {
  text-align: right;
}
</style>