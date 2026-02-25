<template>
  <n-layout style="height: 100vh;" has-sider>
    <!-- Sidebar independiente -->
    <SidebarNav />

    <!-- Contenido principal con footer -->
    <n-layout>
      <n-layout-content
        :native-scrollbar="false"
        content-style="padding: 24px; box-sizing: border-box;"
      >
        <RouterView />
      </n-layout-content>

      <!-- Footer independiente -->
      <AppFooter />
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import SidebarNav from "@/components/SidebarNav.vue"
import AppFooter from "@/components/AppFooter.vue"
</script>
