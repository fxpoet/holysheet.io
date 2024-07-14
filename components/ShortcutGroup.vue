<template>
    <div class="shortcut-group
        relative w-full flex flex-col overflow-hidden rounded-lg
        border border-gray-300 dark:border-gray-800 shadow-lg
        bg-white dark:bg-gray-800"
        :class="isCollapsed ? 'mb-1 shadow-sm' : 'mb-4 shadow-lg'"
        >

        <div class="flex p-3 bg-gray-100 dark:bg-gray-700 cursor-pointer" @click="toggleCollapse" @contextmenu.prevent="openContextMenu">

            <div v-if="isEditing" class="group-name editing flex-grow mr-2" @click.stop>
                <input ref="nameInput" v-model="editedName" class="mt-[2px] bg-transparent outline-none font-bold" style="max-width: 150px;"
                    @blur="saveName" @keyup.enter="saveName">
            </div>

            <h2 v-else class="group-name flex-grow font-bold">
                {{ group.name }}
            </h2>

            <UButton v-if="isEditing"
                icon="i-heroicons-plus-small-solid"
                class="flex-1 flex-grow-0 mr-2"
                color="gray" size="2xs"
                @click.stop="$emit('add-shortcut', group.id)" />

            <UButton
                :icon="isCollapsed ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'"
                class="flex-1 flex-grow-0"
                color="gray" size="2xs" variant="ghost"
                @click.stop="toggleCollapse" />
        </div>

        <VueDraggableNext v-show="!isCollapsed" :list="groupShortcuts" item-key="id"
            :disabled="!isEditing"
            :group="{ name: 'shortcuts', pull: true, put: (to, from) => from.options.group.name === 'shortcuts' }"
            class="p-4 pt-4 bg-white-800"
            @change="handleChange">

            <template v-for="element in groupShortcuts">
                <ShortcutItem :shortcut="element" @update="updateShortcut" @delete="deleteShortcut" @duplicate="duplicateShortcut" />
            </template>

        </VueDraggableNext>

        <UContextMenu v-model="showContextMenu" :virtual-element="virtualElement" class="w-40">
            <div class="p-1 flex flex-col">
                <button @click="removeGroup"
                    class="group flex items-center gap-1.5 w-full px-1.5 py-1.5 text-sm rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                    <UIcon name="i-heroicons-trash-20-solid" />
                    <span class="truncate">Remove Group</span>
                </button>

            </div>
        </UContextMenu>
    </div>
</template>

<script setup>
import { VueDraggableNext } from 'vue-draggable-next'
import ShortcutItem from './ShortcutItem.vue'

const props = defineProps({
    group: { type: Object, required: true }
})

const emit = defineEmits(['add-shortcut', 'update-group', 'resize', 'update', 'delete', 'duplicate', 'delete-group'])

import { useEditorStore } from '@/stores/editor'
const editor = useEditorStore()
const { isEditing } = storeToRefs(editor)

const groupShortcuts = ref(props.group.shortcuts)
const editedName = ref(props.group.name)
const nameInput = ref(null)
const isCollapsed = ref(false)
const virtualElement = ref({ getBoundingClientRect: () => ({}) })
const activeContextMenu = inject('activeContextMenu')

const showContextMenu = computed({
    get: () => activeContextMenu.value === `group-${props.group.id}`,
    set: (value) => {
        if (!value) {
            activeContextMenu.value = null
        }
    }
})

const saveName = () => {
    if (editedName.value !== props.group.name) {
        emit('update-group', { ...props.group, name: editedName.value })
    }
}

const handleChange = (event) => {
    emit('update-group', { ...props.group, shortcuts: groupShortcuts.value });
}

const updateShortcut = (updatedShortcut) => {
    const index = groupShortcuts.value.findIndex(s => s.id === updatedShortcut.id)
    if (index !== -1) {
        groupShortcuts.value[index] = updatedShortcut
        handleChange()
    }
}

const deleteShortcut = (shortcutId) => {
    const index = groupShortcuts.value.findIndex(s => s.id === shortcutId)
    if (index !== -1) {
        groupShortcuts.value.splice(index, 1)
        handleChange()
    }
}

const removeGroup = () => {
    emit('delete-group', props.group.id)
}

const duplicateShortcut = (shortcut) => {
    const newShortcut = { ...shortcut }
    groupShortcuts.value.push(newShortcut)
    handleChange()
}

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
    emit('resize')
}

const openContextMenu = (event) => {

    virtualElement.value.getBoundingClientRect = () => ({
        width: 0, height: 0,
        top: event.clientY,
        right: event.clientX,
        bottom: event.clientY,
        left: event.clientX
    })

    activeContextMenu.value = `group-${props.group.id}`
}
</script>

<style scoped>
.editing input {
    width: 100%;
    font-size: 1em;
    /*outline: 1px solid #ccc;*/
}

.resizer {
    width: 5px;
    height: 100%;
    background-color: #ddd;
    cursor: col-resize;
    position: absolute;
    right: 0;
    top: 0;
}
</style>