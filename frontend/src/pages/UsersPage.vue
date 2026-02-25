<template>
  <n-flex vertical :size="24">
    <PageHeader
      title="Usuarios"
      :subtitle="`${usersStore.count} usuario${usersStore.count !== 1 ? 's' : ''} en tu organización`"
      :icon="PeopleOutline"
      :breadcrumb="[{ label: 'Inicio', path: '/dashboard' }, { label: 'Usuarios' }]"
    >
      <template #actions>
        <n-button v-if="auth.isAdmin" type="primary" @click="showModal = true">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          Nuevo usuario
        </n-button>
      </template>
    </PageHeader>

    <n-alert v-if="usersStore.error" type="error" :title="usersStore.error" />

    <n-data-table
      :columns="columns"
      :data="usersStore.users"
      :loading="usersStore.loading"
      :pagination="{ pageSize: 10 }"
      :scroll-x="600"
      striped
      bordered
    />

    <n-modal
      v-model:show="showModal"
      preset="card"
      title="Crear nuevo usuario"
      style="width: 400px;"
      @after-leave="resetForm"
    >
      <n-form ref="formRef" :model="newUser" :rules="rules">
        <n-form-item path="email" label="Email">
          <n-input v-model:value="newUser.email" placeholder="usuario@empresa.com" :disabled="creating" />
        </n-form-item>
        <n-form-item path="password" label="Contraseña">
          <n-input
            v-model:value="newUser.password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            show-password-on="click"
            :disabled="creating"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-flex justify="end" :size="8">
          <n-button @click="showModal = false" :disabled="creating">Cancelar</n-button>
          <n-button type="primary" :loading="creating" @click="handleCreate">Crear usuario</n-button>
        </n-flex>
      </template>
    </n-modal>
  </n-flex>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from "vue"
import { NTag, NIcon, useMessage } from "naive-ui"
import type { FormInst, DataTableColumns } from "naive-ui"
import { AddOutline, PeopleOutline } from "@vicons/ionicons5"
import { useAuthStore } from "@/stores/auth.store"
import { useUsersStore } from "@/stores/users.store"
import type { User } from "@/types/user.types"
import PageHeader from "@/components/PageHeader.vue"

const auth = useAuthStore()
const usersStore = useUsersStore()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const showModal = ref(false)
const creating = ref(false)
const newUser = ref({ email: "", password: "" })

const rules = {
  email: [
    { required: true, message: "El email es requerido", trigger: "blur" },
    { type: "email" as const, message: "Email inválido", trigger: "blur" }
  ],
  password: [
    { required: true, message: "La contraseña es requerida", trigger: "blur" },
    { min: 8, message: "Mínimo 8 caracteres", trigger: "blur" }
  ]
}

const columns: DataTableColumns<User> = [
  { title: "Email", key: "email", minWidth: 200 },
  {
    title: "ID",
    key: "id",
    width: 120,
    render: (row) => h("span", {}, row.id.slice(0, 8) + "...")
  },
  {
    title: "Org ID",
    key: "organizationId",
    width: 120,
    render: (row) => h("span", {}, row.organizationId ? row.organizationId.slice(0, 8) + "..." : "—")
  },
  {
    title: "Estado",
    key: "status",
    width: 100,
    render: () => h(NTag, { type: "success", size: "small", round: true }, { default: () => "Activo" })
  }
]

function resetForm() {
  newUser.value = { email: "", password: "" }
  formRef.value?.restoreValidation()
}

async function handleCreate() {
  try { await formRef.value?.validate() } catch { return }
  creating.value = true
  try {
    await usersStore.createUser(newUser.value)
    message.success("Usuario creado exitosamente")
    showModal.value = false
  } catch (err: unknown) {
    message.error((err as { message?: string }).message || "Error al crear el usuario")
  } finally {
    creating.value = false
  }
}

onMounted(() => usersStore.fetchUsers())
</script>
