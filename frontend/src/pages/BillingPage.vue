<template>
  <n-flex vertical :size="24">
    <PageHeader
      title="Suscripción y uso"
      subtitle="Administra tu plan y monitorea el consumo de tu organización"
      :icon="CardOutline"
      :breadcrumb="[{ label: 'Inicio', path: '/dashboard' }, { label: 'Suscripción' }]"
    />

    <n-alert v-if="billing.error" type="error" :title="billing.error" />

    <n-spin :show="billing.loading">
      <n-flex vertical :size="24">

        <!-- Plan actual -->
        <n-card title="Plan actual" size="small">
          <template #header-extra>
            <n-tag
              :type="statusTagType"
              size="small"
              round
            >
              {{ billing.subscription?.status ?? '—' }}
            </n-tag>
          </template>

          <n-grid :cols="3" :x-gap="16" responsive="screen" :item-responsive="true">
            <n-grid-item span="3 m:1">
              <n-statistic label="Plan">
                <template #default>
                  <n-text strong style="font-size: 20px;">
                    {{ billing.subscription?.plan.name ?? '—' }}
                  </n-text>
                </template>
              </n-statistic>
            </n-grid-item>
            <n-grid-item span="3 m:1">
              <n-statistic label="Precio mensual">
                <template #default>
                  <n-text strong style="font-size: 20px;">
                    {{ billing.subscription?.plan.price === 0
                      ? 'Gratis'
                      : `$${billing.subscription?.plan.price} ${billing.subscription?.plan.currency}`
                    }}
                  </n-text>
                </template>
              </n-statistic>
            </n-grid-item>
            <n-grid-item span="3 m:1">
              <n-statistic label="Renovación">
                <template #default>
                  <n-text strong style="font-size: 20px;">
                    {{ billing.subscription?.renewalDate
                      ? new Date(billing.subscription.renewalDate).toLocaleDateString('es-CO')
                      : '—'
                    }}
                  </n-text>
                </template>
              </n-statistic>
            </n-grid-item>
          </n-grid>
        </n-card>

        <!-- Uso del mes -->
        <n-card size="small">
          <template #header>
            <n-flex align="center" :size="8">
              <n-text strong>Uso del mes</n-text>
              <n-tag size="small" round>{{ billing.usage?.period ?? '—' }}</n-tag>
            </n-flex>
          </template>

          <n-grid :cols="3" :x-gap="24" :y-gap="16" responsive="screen" :item-responsive="true">
            <n-grid-item v-for="item in usageItems" :key="item.metric" span="3 m:1">
              <n-flex vertical :size="6">
                <n-flex justify="space-between" align="center">
                  <n-text depth="3" style="font-size: 13px;">{{ item.label }}</n-text>
                  <n-text style="font-size: 13px;">
                    <n-text strong>{{ billing.getMetricValue(item.metric) }}</n-text>
                    <n-text depth="3">
                      {{ billing.getLimit(item.metric)?.limit
                        ? ` / ${billing.getLimit(item.metric)?.limit}`
                        : ' / ∞'
                      }}
                    </n-text>
                  </n-text>
                </n-flex>
                <n-progress
                  type="line"
                  :percentage="getPercentage(item.metric)"
                  :status="getStatus(item.metric)"
                  :show-indicator="false"
                  :height="8"
                />
                <n-text v-if="getStatus(item.metric) === 'error'" type="error" style="font-size: 11px;">
                  Límite alcanzado — considera mejorar tu plan
                </n-text>
                <n-text v-else-if="getStatus(item.metric) === 'warning'" type="warning" style="font-size: 11px;">
                  Cerca del límite ({{ getPercentage(item.metric) }}%)
                </n-text>
              </n-flex>
            </n-grid-item>
          </n-grid>
        </n-card>

        <!-- Planes disponibles -->
        <n-card title="Planes disponibles" size="small">
          <n-grid :cols="3" :x-gap="16" :y-gap="16" responsive="screen" :item-responsive="true">
            <n-grid-item v-for="plan in billing.plans" :key="plan.id" span="3 m:1">
              <n-card
                size="small"
                :bordered="true"
                :style="plan.id === billing.subscription?.planId
                  ? 'border-color: #6366f1; background: rgba(99,102,241,0.05)'
                  : ''"
              >
                <n-flex vertical :size="12">
                  <n-flex justify="space-between" align="center">
                    <n-text strong style="font-size: 16px;">{{ plan.name }}</n-text>
                    <n-tag
                      v-if="plan.id === billing.subscription?.planId"
                      type="info"
                      size="small"
                      round
                    >
                      Actual
                    </n-tag>
                  </n-flex>

                  <n-text style="font-size: 22px; font-weight: 700;">
                    {{ plan.price === 0 ? 'Gratis' : `$${plan.price}` }}
                    <n-text depth="3" style="font-size: 13px; font-weight: 400;">
                      {{ plan.price > 0 ? `/${plan.currency}/mes` : '' }}
                    </n-text>
                  </n-text>

                  <!-- Límites -->
                  <n-flex vertical :size="4">
                    <n-text
                      v-for="(val, key) in plan.limits"
                      :key="key"
                      depth="3"
                      style="font-size: 12px;"
                    >
                      ✓ {{ formatLimitLabel(String(key)) }}:
                      {{ val === -1 ? 'Ilimitado' : val }}
                    </n-text>
                  </n-flex>

                  <!-- Features -->
                  <n-flex vertical :size="4">
                    <n-text
                      v-for="(val, key) in plan.features"
                      :key="key"
                      :depth="val ? 1 : 3"
                      style="font-size: 12px;"
                    >
                      {{ val ? '✓' : '✗' }} {{ formatFeatureLabel(String(key)) }}
                    </n-text>
                  </n-flex>

                  <n-button
                    :type="plan.id === billing.subscription?.planId ? 'default' : 'primary'"
                    :disabled="plan.id === billing.subscription?.planId"
                    :loading="billing.upgrading"
                    block
                    size="small"
                    @click="handleUpgrade(plan)"
                  >
                    {{ plan.id === billing.subscription?.planId ? 'Plan actual' : 'Seleccionar' }}
                  </n-button>
                </n-flex>
              </n-card>
            </n-grid-item>
          </n-grid>
        </n-card>

      </n-flex>
    </n-spin>
  </n-flex>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useMessage, useDialog } from "naive-ui"
import { CardOutline } from "@vicons/ionicons5"
import { useBillingStore } from "@/stores/billing.store"
import type { UsageMetricType, Plan } from "@/types/billing.types"
import PageHeader from "@/components/PageHeader.vue"

const billing = useBillingStore()
const message = useMessage()
const dialog = useDialog()

const usageItems: { metric: UsageMetricType; label: string }[] = [
  { metric: "USER_COUNT", label: "Usuarios" },
  { metric: "API_REQUESTS", label: "API Requests" },
  { metric: "RESOURCE_CREATIONS", label: "Recursos creados" }
]

const statusTagType = computed(() => {
  switch (billing.subscription?.status) {
    case "ACTIVE": return "success" as const
    case "TRIAL": return "warning" as const
    case "CANCELED": return "error" as const
    default: return "default" as const
  }
})

function getPercentage(metric: UsageMetricType): number {
  const limit = billing.getLimit(metric)
  if (!limit || !limit.limit || limit.limit === -1) return 0
  return Math.min(100, Math.round((limit.current / limit.limit) * 100))
}

function getStatus(metric: UsageMetricType): "default" | "warning" | "error" {
  const pct = getPercentage(metric)
  if (pct >= 100) return "error"
  if (pct >= 80) return "warning"
  return "default"
}

function formatLimitLabel(key: string): string {
  const map: Record<string, string> = {
    user_count: "Usuarios",
    api_requests: "API Requests",
    resource_creations: "Recursos"
  }
  return map[key] ?? key
}

function formatFeatureLabel(key: string): string {
  const map: Record<string, string> = {
    basic_dashboard: "Dashboard básico",
    advanced_reports: "Reportes avanzados",
    api_access: "Acceso API",
    custom_integrations: "Integraciones custom",
    audit_logs: "Audit logs"
  }
  return map[key] ?? key
}

function handleUpgrade(plan: Plan) {
  dialog.warning({
    title: "Cambiar plan",
    content: `¿Deseas cambiar al plan ${plan.name}${plan.price > 0 ? ` por $${plan.price}/${plan.currency}/mes` : ' (Gratis)'}?`,
    positiveText: "Confirmar",
    negativeText: "Cancelar",
    onPositiveClick: async () => {
      try {
        await billing.upgrade(plan.id)
        message.success(`Plan cambiado a ${plan.name} exitosamente`)
        await billing.fetchAll()
      } catch (err: unknown) {
        message.error((err as { message?: string }).message ?? "Error al cambiar el plan")
      }
    }
  })
}

onMounted(() => billing.fetchAll())
</script>
