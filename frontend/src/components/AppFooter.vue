<template>
  <n-layout-footer
    bordered
    style="padding: 12px 24px;"
  >
    <n-flex justify="space-between" align="center" :wrap="false">
      <!-- Left: brand + version -->
      <n-flex align="center" :size="8">
        <n-avatar round size="tiny" color="#6366f1" style="font-weight: 700; font-size: 10px;">
          S
        </n-avatar>
        <n-text depth="3" style="font-size: 12px;">
          SaaS Platform
        </n-text>
        <n-tag size="tiny" round>v1.0.0</n-tag>
      </n-flex>

      <!-- Center: links -->
      <n-flex :size="16" align="center">
        <n-button
          v-for="link in links"
          :key="link.label"
          text
          size="tiny"
          tag="a"
          :href="link.href"
          target="_blank"
        >
          {{ link.label }}
        </n-button>
      </n-flex>

      <!-- Right: copyright -->
      <n-text depth="3" style="font-size: 11px; white-space: nowrap;">
        © {{ year }} SaaS Platform
      </n-text>
    </n-flex>
  </n-layout-footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()

const links = [
  { label: "Docs", href: "#" },
  { label: "Soporte", href: "#" },
  { label: "Privacidad", href: "#" }
]
</script>
