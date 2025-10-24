<template>
  <a-modal
    :open="open"
    title="프로필"
    :footer="null"
    :width="isMobile ? '90%' : 500"
    @cancel="$emit('update:open', false)"
  >
    <div class="profile-content">
      <!-- 프로필 내용 -->
    </div>
</a-modal>
</template>

<script setup>
defineProps(['open', 'user'])
defineEmits(['update:open'])

const isMobile = ref(window.innerWidth <= 768)
</script>