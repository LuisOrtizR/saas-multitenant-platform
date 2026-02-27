<template>
  <n-flex vertical :size="24">
    <PageHeader
      title="Plataforma"
      subtitle="Vista global de todas las organizaciones"
      :icon="BusinessOutline"
      tag="SUPER_ADMIN"
      tag-type="error"
      :breadcrumb="[{ label: 'Inicio', path: '/dashboard' }, { label: 'Plataforma' }]"
    />

    <n-alert v-if="error" type="error" :title="error" />

    <n-grid :cols="2" :x-gap="16">
      <n-grid-item>
        <n-card size="small">
          <n-statistic label="Organizaciones" :value="organizations.length" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card size="small">
          <n-statistic label="Usuarios totales" :value="totalUsers" />
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-data-table
      :columns="columns"
      :data="organizations"
      :loading="loading"
      :pagination="{ pageSize: 10 }"
      :scroll-x="800"
      striped
      bordered
    />
  </n-flex>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from "vue"
import { NTag, NButton } from "naive-ui"
import type { DataTableColumns } from "naive-ui"
import { BusinessOutline } from "@vicons/ionicons5"
import { platformApi, type PlatformOrganization } from "@/api/platform.api"
import PageHeader from "@/components/PageHeader.vue"
import { useMessage } from "naive-ui"

const organizations = ref<PlatformOrganization[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const message = useMessage()

const totalUsers = computed(() =>
  organizations.value.reduce((sum, org) => sum + org.users.length, 0)
)

const planName = (org: PlatformOrganization) => org.subscription?.plan?.name ?? "—"

const planTagType = (name: string): "error" | "warning" | "default" => {
  if (name === "ENTERPRISE") return "error"
  if (name === "PRO") return "warning"
  return "default"
}

async function handleSuspend(org: PlatformOrganization) {
  try {
    await platformApi.suspendOrganization(org.id)
    org.suspended = true
    message.success(`Organización ${org.name} suspendida`)
  } catch (err: unknown) {
    message.error((err as { message?: string }).message ?? "Error al suspender")
  }
}

const columns: DataTableColumns<PlatformOrganization> = [
  { title: "Nombre", key: "name", minWidth: 140 },
  { title: "Slug", key: "slug", minWidth: 120 },
  {
    title: "Plan",
    key: "subscription",
    width: 110,
    render: (row) => h(NTag, {
      type: planTagType(planName(row)),
      size: "small",
      round: true
    }, { default: () => planName(row) })
  },
  {
    title: "Usuarios",
    key: "users",
    width: 90,
    render: (row) => String(row.users.length)
  },
  {
    title: "Estado",
    key: "suspended",
    width: 110,
    render: (row) => h(NTag, {
      type: row.suspended ? "error" : "success",
      size: "small",
      round: true
    }, { default: () => row.suspended ? "Suspendida" : "Activa" })
  },
  {
    title: "Creada",
    key: "createdAt",
    width: 110,
    render: (row) => new Date(row.createdAt).toLocaleDateString("es-CO")
  },
  {
    title: "Acciones",
    key: "actions",
    width: 120,
    render: (row) => h(NButton, {
      size: "small",
      type: "error",
      ghost: true,
      disabled: row.suspended,
      onClick: () => handleSuspend(row)
    }, { default: () => row.suspended ? "Suspendida" : "Suspender" })
  }
]

onMounted(async () => {
  loading.value = true
  try {
    organizations.value = await platformApi.getOrganizations()
  } catch (err: unknown) {
    error.value = (err as { message?: string }).message ?? "Error al cargar organizaciones"
  } finally {
    loading.value = false
  }
})
</script>
