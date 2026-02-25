<template>
  <div style="border-top: 1px solid rgba(255,255,255,0.08); padding: 12px 14px;">
    <n-flex align="center" justify="space-between">
      <!-- Avatar + info -->
      <n-flex align="center" :size="8" style="min-width: 0; flex: 1; overflow: hidden;">
        <n-tooltip trigger="hover" placement="right">
          <template #trigger>
            <n-avatar
              round
              size="small"
              color="#6366f1"
              style="font-weight: 600; flex-shrink: 0; cursor: default;"
            >
              {{ userInitial }}
            </n-avatar>
          </template>
          {{ auth.user?.email }}
        </n-tooltip>

        <n-flex v-show="!collapsed" vertical :size="1" style="min-width: 0; flex: 1;">
          <n-ellipsis style="max-width: 110px; font-size: 12px;">
            {{ auth.user?.email }}
          </n-ellipsis>
          <n-text depth="3" style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.03em;">
            {{ auth.user?.role }}
          </n-text>
        </n-flex>
      </n-flex>

      <!-- Logout button -->
      <n-tooltip v-show="!collapsed" trigger="hover" placement="top">
        <template #trigger>
          <n-button
            quaternary
            circle
            size="small"
            :focusable="false"
            @click="handleLogout"
          >
            <template #icon>
              <n-icon><LogOutOutline /></n-icon>
            </template>
          </n-button>
        </template>
        Cerrar sesión
      </n-tooltip>
    </n-flex>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useDialog } from "naive-ui"
import { LogOutOutline } from "@vicons/ionicons5"
import { useAuthStore } from "@/stores/auth.store"

defineProps<{ collapsed: boolean }>()

const auth = useAuthStore()
const dialog = useDialog()

const userInitial = computed(() => (auth.user?.email?.[0] ?? "U").toUpperCase())

function handleLogout() {
  dialog.warning({
    title: "Cerrar sesión",
    content: "¿Estás seguro que deseas cerrar sesión?",
    positiveText: "Sí, salir",
    negativeText: "Cancelar",
    onPositiveClick: () => auth.logout()
  })
}
</script>
