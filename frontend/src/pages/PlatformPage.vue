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
      :scroll-x="700"
      striped
      bordered
    />
  </n-flex>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from "vue"
import { NTag } from "naive-ui"
import type { DataTableColumns } from "naive-ui"
import { BusinessOutline } from "@vicons/ionicons5"
import { platformApi, type PlatformOrganization } from "@/api/platform.api"
import PageHeader from "@/components/PageHeader.vue"

const organizations = ref<PlatformOrganization[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const totalUsers = computed(() =>
  organizations.value.reduce((sum, org) => sum + org.users.length, 0)
)

const planTagType = (plan: string): "error" | "warning" | "default" => {
  if (plan === "ENTERPRISE") return "error"
  if (plan === "PRO") return "warning"
  return "default"
}

const columns: DataTableColumns<PlatformOrganization> = [
  { title: "Nombre", key: "name", minWidth: 140 },
  { title: "Slug", key: "slug", minWidth: 120 },
  {
    title: "Plan",
    key: "plan",
    width: 100,
    render: (row) => h(NTag, { type: planTagType(row.plan), size: "small", round: true }, { default: () => row.plan })
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
  }
]

onMounted(async () => {
  loading.value = true
  try {
    organizations.value = await platformApi.getOrganizations()
  } catch (err: unknown) {
    error.value = (err as { message?: string }).message || "Error al cargar organizaciones"
  } finally {
    loading.value = false
  }
})
</script>
