<template>
    <UMain>
        <NuxtLayout>
            <NuxtPage />
            <!-- 푸터 추가 -->
            <footer class="text-center text-xs text-gray-500 mt-1">
                How to Use:<br/><br/>
                Double Click to Edit.<br/>
                Drag to re-order.<br/>
                Right Click to Remove.<br/>
                Resizable by dragging the right edge.
            </footer>
        </NuxtLayout>
    </UMain>
    <UFooter />
</template>

<script setup lang="ts">
const activeContextMenu = ref(null)
provide('activeContextMenu', activeContextMenu)
</script>