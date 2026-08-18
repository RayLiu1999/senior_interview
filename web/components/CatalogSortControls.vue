<script setup lang="ts">
import type { CatalogSort } from '~/utils/catalog-filters'

const props = defineProps<{ modelValue: CatalogSort }>()
const emit = defineEmits<{ 'update:modelValue': [value: CatalogSort] }>()

const sortOptions: Array<{ value: CatalogSort; label: string }> = [
  { value: 'default', label: '原始順序' },
  { value: 'difficulty-asc', label: '難度升冪' },
  { value: 'difficulty-desc', label: '難度降冪' },
  { value: 'importance-asc', label: '重要性升冪' },
  { value: 'importance-desc', label: '重要性降冪' },
]
</script>

<template>
  <div class="sort-controls" role="group" aria-label="文章排序">
    <span class="sort-label">排序</span>
    <div class="sort-buttons">
      <button
        v-for="option in sortOptions"
        :key="option.value"
        class="button button-quiet sort-button"
        :class="{ active: props.modelValue === option.value }"
        type="button"
        :aria-pressed="props.modelValue === option.value"
        @click="emit('update:modelValue', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
