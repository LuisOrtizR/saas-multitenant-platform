<template>
  <n-flex vertical :size="24">
    <PageHeader
      title="Dashboard"
      :subtitle="`Bienvenido de nuevo, ${auth.user?.email}`"
      :icon="GridOutline"
      :breadcrumb="[{ label: 'Inicio' }, { label: 'Dashboard' }]"
    />

    <!-- Stats principales -->
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

    <!-- Usage del plan (issue #27) -->
    <n-card title="Uso del plan" size="small" v-if="!auth.isSuperAdmin">
      <template #header-extra>
        <n-tag size="small" round>{{ billing.usage?.period ?? '—' }}</n-tag>
      </template>

      <n-spin :show="billing.loading">
        <n-grid :cols="3" :x-gap="16" :y-gap="16" responsive="screen" :item-responsive="true">
          <!-- API Requests -->
          <n-grid-item span="3 m:1">
            <n-flex vertical :size="4">
              <n-flex justify="space-between">
                <n-text depth="3" style="font-size: 13px;">API Requests</n-text>
                <n-text depth="3" style="font-size: 13px;">
                  {{ billing.getMetricValue('API_REQUESTS') }}
                  <span v-if="billing.getLimit('API_REQUESTS')?.limit">
                    / {{ billing.getLimit('API_REQUESTS')?.limit }}
                  </span>
                  <span v-else> / ∞</span>
                </n-text>
              </n-flex>
              <n-progress
                type="line"
                :percentage="getPercentage('API_REQUESTS')"
                :status="getStatus('API_REQUESTS')"
                :show-indicator="false"
              />
            </n-flex>
          </n-grid-item>

          <!-- User Count -->
          <n-grid-item span="3 m:1">
            <n-flex vertical :size="4">
              <n-flex justify="space-between">
                <n-text depth="3" style="font-size: 13px;">Usuarios</n-text>
                <n-text depth="3" style="font-size: 13px;">
                  {{ billing.getMetricValue('USER_COUNT') }}
                  <span v-if="billing.getLimit('USER_COUNT')?.limit">
                    / {{ billing.getLimit('USER_COUNT')?.limit }}
                  </span>
                  <span v-else> / ∞</span>
                </n-text>
              </n-flex>
              <n-progress
                type="line"
                :percentage="getPercentage('USER_COUNT')"
                :status="getStatus('USER_COUNT')"
                :show-indicator="false"
              />
            </n-flex>
          </n-grid-item>

          <!-- Resources -->
          <n-grid-item span="3 m:1">
            <n-flex vertical :size="4">
              <n-flex justify="space-between">
                <n-text depth="3" style="font-size: 13px;">Recursos creados</n-text>
                <n-text depth="3" style="font-size: 13px;">
                  {{ billing.getMetricValue('RESOURCE_CREATIONS') }}
                  <span v-if="billing.getLimit('RESOURCE_CREATIONS')?.limit">
                    / {{ billing.getLimit('RESOURCE_CREATIONS')?.limit }}
                  </span>
                  <span v-else> / ∞</span>
                </n-text>
              </n-flex>
              <n-progress
                type="line"
                :percentage="getPercentage('RESOURCE_CREATIONS')"
                :status="getStatus('RESOURCE_CREATIONS')"
                :show-indicator="false"
              />
            </n-flex>
          </n-grid-item>
        </n-grid>
      </n-spin>
    </n-card>

    <!-- Info sesión -->
    <n-card title="Información de sesión" size="small">
      <n-descriptions bordered :column="1" label-placement="left">
        <n-descriptions-item label="User ID">
          <n-text code>{{ auth.user?.userId }}</n-text>
        </n-descriptions-item>
        <n-descriptions-item label="Email">{{ auth.user?.email }}</n-descriptions-item>
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
import { PeopleOutline, GridOutline } from "@vicons/ionicons5"
import { useAuthStore } from "@/stores/auth.store"
import { useUsersStore } from "@/stores/users.store"
import { useBillingStore } from "@/stores/billing.store"
import type { UsageMetricType } from "@/types/billing.types"
import PageHeader from "@/components/PageHeader.vue"

const auth = useAuthStore()
const usersStore = useUsersStore()
const billing = useBillingStore()

const roleTagType = computed(() => {
  switch (auth.user?.role) {
    case "SUPER_ADMIN": return "error" as const
    case "ADMIN": return "warning" as const
    default: return "info" as const
  }
})

function getPercentage(metric: UsageMetricType): number {
  const limit = billing.getLimit(metric)
  if (!limit || !limit.limit) return 0
  return Math.min(100, Math.round((limit.current / limit.limit) * 100))
}

function getStatus(metric: UsageMetricType): "default" | "warning" | "error" {
  const pct = getPercentage(metric)
  if (pct >= 100) return "error"
  if (pct >= 80) return "warning"
  return "default"
}

onMounted(async () => {
  if (!auth.isSuperAdmin) {
    await Promise.all([
      usersStore.fetchUsers(),
      billing.fetchAll()
    ])
  }
})
</script>
