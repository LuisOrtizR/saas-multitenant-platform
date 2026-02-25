<template>
  <n-layout-sider
    bordered
    collapse-mode="width"
    :collapsed-width="64"
    :width="220"
    show-trigger="bar"
    :native-scrollbar="false"
    v-model:collapsed="collapsed"
  >
    <n-flex vertical justify="space-between" style="height: 100%; box-sizing: border-box;">
      <!-- Brand -->
      <div>
        <n-flex
          align="center"
          :size="10"
          style="padding: 18px 20px 14px; border-bottom: 1px solid rgba(255,255,255,0.08);"
        >
          <n-avatar
            round
            size="small"
            color="#6366f1"
            style="font-weight: 700; flex-shrink: 0; cursor: pointer;"
            @click="router.push('/dashboard')"
          >
            S
          </n-avatar>
          <n-text
            v-show="!collapsed"
            strong
            style="font-size: 14px; white-space: nowrap; cursor: pointer;"
            @click="router.push('/dashboard')"
          >
            SaaS Platform
          </n-text>
        </n-flex>

        <!-- Menu items -->
        <n-menu
          :value="activeKey"
          :options="menuOptions"
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="20"
          style="padding-top: 8px;"
          @update:value="handleSelect"
        />
      </div>

      <!-- User footer -->
      <SidebarFooter :collapsed="collapsed" />
    </n-flex>
  </n-layout-sider>
</template>

<script setup lang="ts">
import { computed, h, ref, onMounted, onUnmounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { NIcon } from "naive-ui"
import type { MenuOption } from "naive-ui"
import { GridOutline, PeopleOutline, BusinessOutline } from "@vicons/ionicons5"
import { useAuthStore } from "@/stores/auth.store"
import SidebarFooter from "./SidebarFooter.vue"

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const activeKey = computed(() => route.name as string)
const collapsed = ref(window.innerWidth < 900)

function onResize() {
  collapsed.value = window.innerWidth < 900
}
onMounted(() => window.addEventListener("resize", onResize))
onUnmounted(() => window.removeEventListener("resize", onResize))

const menuOptions = computed<MenuOption[]>(() => {
  const base: MenuOption[] = [
    {
      label: "Dashboard",
      key: "dashboard",
      icon: () => h(NIcon, null, { default: () => h(GridOutline) })
    }
  ]
  if (auth.isSuperAdmin) {
    base.push({
      label: "Organizaciones",
      key: "platform",
      icon: () => h(NIcon, null, { default: () => h(BusinessOutline) })
    })
  } else {
    base.push({
      label: "Usuarios",
      key: "users",
      icon: () => h(NIcon, null, { default: () => h(PeopleOutline) })
    })
  }
  return base
})

function handleSelect(key: string) {
  router.push({ name: key })
  if (window.innerWidth < 900) collapsed.value = true
}
</script>
