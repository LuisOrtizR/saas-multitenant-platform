<template>
  <n-flex vertical :size="24">
    <PageHeader
      title="Dashboard"
      :subtitle="`Bienvenido de nuevo, ${auth.user?.email}`"
      :icon="GridOutline"
      :breadcrumb="[{ label: 'Inicio' }, { label: 'Dashboard' }]"
    />

    <n-grid :cols="3" :x-gap="16" :y-gap="16" responsive="screen" :item-responsive="true">
      <n-grid-item span="3 m:1">
        <n-card size="small">
          <n-statistic label="Usuarios" :value="usersStore.count">
            <template #prefix>
              <n-icon color="#6366f1"><PeopleOutline /></n-icon>
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
      <n-grid-item span="3 m:1">
        <n-card size="small">
          <n-statistic label="Tu rol" :value="auth.user?.role ?? '—'" />
        </n-card>
      </n-grid-item>
      <n-grid-item span="3 m:1">
        <n-card size="small">
          <n-statistic
            label="Organización"
            :value="auth.user?.organizationId ? 'Activa' : '—'"
          />
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-card title="Información de sesión" size="small">
      <n-descriptions bordered :column="1" label-placement="left">
        <n-descriptions-item label="User ID">
          <n-text code>{{ auth.user?.userId }}</n-text>
        </n-descriptions-item>
        <n-descriptions-item label="Email">
          {{ auth.user?.email }}
        </n-descriptions-item>
        <n-descriptions-item label="Rol">
          <n-tag :type="roleTagType" size="small" round>{{ auth.user?.role }}</n-tag>
        </n-descriptions-item>
        <n-descriptions-item v-if="auth.user?.organizationId" label="Organization ID">
          <n-text code>{{ auth.user.organizationId }}</n-text>
        </n-descriptions-item>
      </n-descriptions>
    </n-card>
  </n-flex>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue"
import { NIcon } from "naive-ui"
import { PeopleOutline, GridOutline } from "@vicons/ionicons5"
import { useAuthStore } from "@/stores/auth.store"
import { useUsersStore } from "@/stores/users.store"
import PageHeader from "@/components/PageHeader.vue"

const auth = useAuthStore()
const usersStore = useUsersStore()

const roleTagType = computed(() => {
  switch (auth.user?.role) {
    case "SUPER_ADMIN": return "error" as const
    case "ADMIN": return "warning" as const
    default: return "info" as const
  }
})

onMounted(async () => {
  if (!auth.isSuperAdmin) await usersStore.fetchUsers()
})
</script>
