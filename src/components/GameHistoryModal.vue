<template>
  <a-modal
    :open="open"
    title="게임 기록"
    :footer="null"
    :width="isMobile ? '95%' : 700"
    @cancel="$emit('update:open', false)"
  >
    <div class="history-content">
      <!-- 게임 기록 내용 -->
    </div>
</a-modal>
</template>

<script setup>
defineProps(['open', 'history'])
defineEmits(['update:open'])

const isMobile = ref(window.innerWidth <= 768)
</script>