<template>
  <n-flex justify="space-between" align="center" style="margin-bottom: 24px;">
    <div>
      <n-flex align="center" :size="8" style="margin-bottom: 4px;">
        <!-- Breadcrumb opcional -->
        <n-breadcrumb v-if="breadcrumb && breadcrumb.length > 0">
          <n-breadcrumb-item
            v-for="(item, i) in breadcrumb"
            :key="i"
            :clickable="!!item.path"
            @click="item.path && router.push(item.path)"
          >
            {{ item.label }}
          </n-breadcrumb-item>
        </n-breadcrumb>
      </n-flex>

      <n-flex align="center" :size="10">
        <n-icon v-if="icon" :size="24" :color="iconColor ?? '#6366f1'">
          <component :is="icon" />
        </n-icon>
        <n-h2 style="margin: 0; line-height: 1.2;">{{ title }}</n-h2>
        <n-tag v-if="tag" :type="tagType ?? 'default'" size="small" round>
          {{ tag }}
        </n-tag>
      </n-flex>

      <n-text v-if="subtitle" depth="3" style="font-size: 13px; margin-top: 4px; display: block;">
        {{ subtitle }}
      </n-text>
    </div>

    <!-- Slot para acciones (botones, etc.) -->
    <slot name="actions" />
  </n-flex>

  <n-divider style="margin: 0 0 24px;" />
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import type { TagProps } from "naive-ui"

defineProps<{
  title: string
  subtitle?: string
  icon?: unknown
  iconColor?: string
  tag?: string
  tagType?: TagProps["type"]
  breadcrumb?: Array<{ label: string; path?: string }>
}>()

const router = useRouter()
</script>
