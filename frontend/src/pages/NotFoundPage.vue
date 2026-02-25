<template>
  <n-flex justify="center" align="center" vertical style="min-height: 100vh;" :size="16">
    <n-result status="404" title="Página no encontrada" description="La página que buscas no existe o fue movida.">
      <template #footer>
        <n-button type="primary" @click="$router.push('/')">Volver al inicio</n-button>
      </template>
    </n-result>
  </n-flex>
</template>

<script setup lang="ts">
</script>
