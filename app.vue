<template>
    <UMain>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UMain>
    <UFooter />
</template>

<script setup lang="ts">
const activeContextMenu = ref(null)
provide('activeContextMenu', activeContextMenu)
</script>