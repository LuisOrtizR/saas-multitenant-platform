<template>
  <n-flex justify="center" align="center" style="min-height: 100vh; background: var(--n-color);">
    <n-card style="width: 400px;" title="Iniciar sesión" :bordered="true" size="large">
      <template #header-extra>
        <n-text depth="3" style="font-size: 13px;">SaaS Platform</n-text>
      </template>

      <n-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleSubmit">
        <n-form-item path="email" label="Email">
          <n-input
            v-model:value="form.email"
            placeholder="tu@email.com"
            :disabled="loading"
            clearable
          />
        </n-form-item>

        <n-form-item path="password" label="Contraseña">
          <n-input
            v-model:value="form.password"
            type="password"
            placeholder="••••••••"
            show-password-on="click"
            :disabled="loading"
            @keyup.enter="handleSubmit"
          />
        </n-form-item>

        <n-button
          type="primary"
          block
          :loading="loading"
          attr-type="submit"
          @click="handleSubmit"
        >
          Iniciar sesión
        </n-button>
      </n-form>

      <template #footer>
        <n-flex justify="center">
          <n-text depth="3">¿No tienes cuenta? </n-text>
          <n-button text type="primary" @click="$router.push('/register')">
            Crear organización
          </n-button>
        </n-flex>
      </template>
    </n-card>

    <!-- Organization selection modal -->
    <n-modal
      v-model:show="auth.requiresOrgSelection"
      preset="card"
      title="Selecciona una organización"
      :mask-closable="false"
      :closable="false"
      style="width: 420px;"
    >
      <n-flex vertical :size="8">
        <n-text depth="3">Tu cuenta pertenece a múltiples organizaciones.</n-text>
        <n-radio-group v-model:value="selectedOrgId">
          <n-flex vertical :size="8">
            <n-radio
              v-for="org in auth.pendingOrganizations"
              :key="org.id"
              :value="org.id"
            >
              <n-flex align="center" :size="8">
                <n-avatar round size="small" style="background: #6366f1;">
                  {{ (org.name[0] ?? "O").toUpperCase() }}
                </n-avatar>
                <n-flex vertical :size="0">
                  <n-text strong>{{ org.name }}</n-text>
                  <n-text depth="3" style="font-size: 12px;">@{{ org.slug }}</n-text>
                </n-flex>
              </n-flex>
            </n-radio>
          </n-flex>
        </n-radio-group>
      </n-flex>

      <template #footer>
        <n-flex justify="end" :size="8">
          <n-button @click="auth.cancelOrgSelection()">Cancelar</n-button>
          <n-button
            type="primary"
            :disabled="!selectedOrgId"
            :loading="selectingOrg"
            @click="handleSelectOrg"
          >
            Continuar
          </n-button>
        </n-flex>
      </template>
    </n-modal>
  </n-flex>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useMessage } from "naive-ui"
import type { FormInst } from "naive-ui"
import { useAuthStore } from "@/stores/auth.store"

const auth = useAuthStore()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const selectingOrg = ref(false)
const selectedOrgId = ref<string | null>(null)

const form = ref({ email: "", password: "" })

const rules = {
  email: [{ required: true, message: "El email es requerido", trigger: "blur" }],
  password: [{ required: true, message: "La contraseña es requerida", trigger: "blur" }]
}

async function handleSubmit() {
  try { await formRef.value?.validate() } catch { return }
  loading.value = true
  try {
    await auth.login(form.value)
  } catch (err: unknown) {
    message.error((err as { message?: string }).message || "Credenciales inválidas")
  } finally {
    loading.value = false
  }
}

async function handleSelectOrg() {
  if (!selectedOrgId.value) return
  selectingOrg.value = true
  try {
    await auth.selectOrganization(selectedOrgId.value)
  } catch (err: unknown) {
    message.error((err as { message?: string }).message || "Error al seleccionar organización")
  } finally {
    selectingOrg.value = false
  }
}
</script>
