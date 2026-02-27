<template>
  <n-flex justify="center" align="center" style="min-height: 100vh; background: var(--n-color);">
    <n-card style="width: 440px;" title="Crear organización" size="large">
      <template #header-extra>
        <n-text depth="3" style="font-size: 13px;">SaaS Platform</n-text>
      </template>

      <n-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleSubmit">
        <n-form-item path="name" label="Nombre de la organización">
          <n-input v-model:value="form.name" placeholder="Mi Empresa S.A." :disabled="loading" />
        </n-form-item>

        <n-form-item path="slug" label="Identificador único (slug)">
          <n-input v-model:value="form.slug" :disabled="loading">
            <template #prefix><n-text depth="3">@</n-text></template>
            <template #suffix>
              <n-tag size="tiny" type="info" round>auto</n-tag>
            </template>
          </n-input>
          <template #feedback>
            <n-text depth="3" style="font-size: 11px;">
              Se usa en tu URL: app.plataforma.com/<strong>{{ form.slug || "tu-empresa" }}</strong>
            </n-text>
          </template>
        </n-form-item>

        <n-divider title-placement="left">
          <n-text depth="3" style="font-size: 12px;">Cuenta de administrador</n-text>
        </n-divider>

        <n-form-item path="email" label="Email del administrador">
          <n-input v-model:value="form.email" placeholder="admin@miempresa.com" :disabled="loading" />
          <template #feedback>
            <n-text depth="3" style="font-size: 11px;">
              Esta persona tendrá acceso completo como administrador de la organización.
            </n-text>
          </template>
        </n-form-item>

        <n-form-item path="password" label="Contraseña">
          <n-input
            v-model:value="form.password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            show-password-on="click"
            :disabled="loading"
          />
        </n-form-item>

        <n-button type="primary" block :loading="loading" @click="handleSubmit">
          Crear organización
        </n-button>
      </n-form>

      <template #footer>
        <n-flex justify="center">
          <n-text depth="3">¿Ya tienes cuenta? </n-text>
          <n-button text type="primary" @click="$router.push('/login')">
            Iniciar sesión
          </n-button>
        </n-flex>
      </template>
    </n-card>
  </n-flex>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { useMessage } from "naive-ui"
import type { FormInst } from "naive-ui"
import { useAuthStore } from "@/stores/auth.store"

const auth = useAuthStore()
const message = useMessage()
const formRef = ref<FormInst | null>(null)
const loading = ref(false)

const form = ref({ name: "", slug: "", email: "", password: "" })

watch(() => form.value.name, (name) => {
  form.value.slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
})

const rules = {
  name: [{ required: true, message: "El nombre es requerido", trigger: "blur" }],
  slug: [
    { required: true, message: "El slug es requerido", trigger: "blur" },
    { pattern: /^[a-z0-9-]+$/, message: "Solo minúsculas, números y guiones", trigger: "input" }
  ],
  email: [
    { required: true, message: "El email es requerido", trigger: "blur" },
    { type: "email" as const, message: "Email inválido", trigger: "blur" }
  ],
  password: [
    { required: true, message: "La contraseña es requerida", trigger: "blur" },
    { min: 8, message: "Mínimo 8 caracteres", trigger: "blur" }
  ]
}

async function handleSubmit() {
  try { await formRef.value?.validate() } catch { return }
  loading.value = true
  try {
    await auth.register(form.value)
    message.success("¡Organización creada! Ahora puedes iniciar sesión.")
  } catch (err: unknown) {
    message.error((err as { message?: string }).message ?? "Error al crear la organización")
  } finally {
    loading.value = false
  }
}
</script>
