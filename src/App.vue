<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <Transition name="fade" appear mode="out-in">
    <RouterView />
  </Transition>
</template>

<style>
@font-face {
	font-family: 'MyFont';
	src: url(font/GenJyuuGothic-Regular.ttf);
}

* {
  margin: 0;
  font-family: 'MyFont', sans-serif;
}

body {
    background-color: #f5f5f5;
}

.fade-enter-active {
  transition: opacity 1.0s;
}

.fade-enter-from {
  opacity: 0.0;
}
</style>
