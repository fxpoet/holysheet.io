<template>
    <div class="row relative flex mb-1 justify-between" :class="{ editingRow: isEditing }"
        @contextmenu.prevent="onContextMenu">

        <div v-if="isEditing" class="editing py-1.5 pr-2 border-b border-gray-300 min-w-[50px] cursor-pointer flex-grow">
            <input v-model="editedDescription" @blur="onDescBlur" @keyup.enter="saveDescription"
                @keydown.tab.prevent="focusKeyInput" ref="descriptionInput" />
        </div>

        <div v-else @dblclick="startEditingDescription"
            class="label bg-white dark:bg-gray-800 py-1.5 pr-2 border-gray-300 mr-1 min-w-[50px] cursor-pointer">
            {{ shortcut.description }}
        </div>

        <div v-if="isEditing" class="editing py-1.5 pl-1.5 border-b border-gray-300 min-w-[50px] cursor-pointer text-right">
            <input v-model="editedKey" @blur="onKeyBlur" @keyup.enter="saveKey"
                @keydown.tab.prevent="focusDescInput" ref="keyInput" class="text-right" />
        </div>

        <div v-else @dblclick="startEditingKey"
            class="label bg-white dark:bg-gray-800 py-1.5 pl-1.5 border-gray-300 Numin-w-[50px] cursor-pointer text-right">
            <component :is="() => renderShortcut(shortcut.key)" />
        </div>

        <UContextMenu v-model="showContextMenu" :virtual-element="virtualElement" class="w-40">
            <div class="p-1 flex flex-col">
                <button @click="removeShortcut"
                    class="group flex items-center gap-1.5 w-full px-1.5 py-1.5 text-sm rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                    <UIcon name="i-heroicons-trash-20-solid" />
                    <span class="truncate">Remove</span>
                    <span class="ms-auto">
                        <UKbd>DEL</UKbd>
                    </span>
                </button>

                <button @click="editShortcut"
                    class="group flex items-center gap-1.5 w-full px-1.5 py-1.5 text-sm rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    tabindex="-1">
                    <UIcon name="i-heroicons-pencil-square-20-solid" />
                    <span class="truncate">Edit</span>
                    <span class="ms-auto">
                        <UKbd>E</UKbd>
                    </span>
                </button>

                <button @click="duplicateShortcut"
                    class="group flex items-center gap-1.5 w-full px-1.5 py-1.5 text-sm rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                    <UIcon name="i-heroicons-document-duplicate-20-solid" />
                    <span class="truncate">Duplicate</span>
                    <span class="ms-auto">
                        <UKbd>D</UKbd>
                    </span>
                </button>
            </div>
        </UContextMenu>
    </div>
</template>

<script setup>
import { useMouse, useWindowScroll } from '@vueuse/core'
import { UButton } from '#components'

const props = defineProps({
    shortcut: { type: Object, required: true }
})

const emit = defineEmits(['update', 'delete', 'duplicate'])

const isEditing = ref(false)
const editedKey = ref(props.shortcut.key)
const editedDescription = ref(props.shortcut.description)

const keyInput = ref(null)
const descriptionInput = ref(null)

const renderShortcut = (value) => {
    const keys = String(value).split('+').map(key => key.trim());
    const display = [];

    keys.forEach((key, index) => {
        if (index > 0) {
            display.push(h('span', { class: 'mx-1' }, '+'));
        }

        if (['⌘', '⌃', '⌥', '⇧', '⇪', '⇥', '⎋', '⌫', '⌦', '⇥', '⇪', '␣', '↑', '↓', '←', '→',
            'CTRL', 'ALT', 'SHIFT', 'CONTROL', 'OPTION', 'COMMAND', 'WIN', 'ENTER', 'RETURN', 'BACK', 'BACKSPACE', 'DELETE', 'DEL', 'ESC', 'TAB',
            'CAPSLOCK', 'SPACE', 'ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT','LEFT','RIGHT', 'UP', 'DOWN'
        ].includes(key.toUpperCase())) {
            display.push(h(UButton, { class: 'shadow min-w-[40px]', size: 'xs', color: 'gray' }, () => key));
        } else {
            display.push(h(UButton, { class: 'shadow min-w-[24px]', size: 'xs', color: 'gray' }, () => key));
        }
    });

    return display;
}


const { x, y } = useMouse()
const { y: windowY } = useWindowScroll()
const activeContextMenu = inject('activeContextMenu')
const virtualElement = ref({ getBoundingClientRect: () => ({}) })

const onContextMenu = (event) => {
    const top = unref(y) - unref(windowY)
    const left = unref(x)

    virtualElement.value.getBoundingClientRect = () => ({
        width: 0, height: 0,
        top, left
    })

    activeContextMenu.value = props.shortcut.id
    showContextMenu.value = true
}

const showContextMenu = computed({
    get: () => activeContextMenu.value === props.shortcut.id,
    set: (value) => {
        if (!value) {
            activeContextMenu.value = null
        }
    }
})

const startEditingKey = () => {
    isEditing.value = true;
    editedKey.value = props.shortcut.key;
    nextTick(() => keyInput.value.focus());
}

const startEditingDescription = () => {
    isEditing.value = true;
    editedDescription.value = props.shortcut.description;
    nextTick(() => descriptionInput.value.focus());
}

const saveKey = () => {
    isEditing.value = false;
    if (editedKey.value !== props.shortcut.key) {
        emit('update', { ...props.shortcut, key: editedKey.value });
    }
}

const saveDescription = () => {
    isEditing.value = false;
    if (editedDescription.value !== props.shortcut.description) {
        emit('update', { ...props.shortcut, description: editedDescription.value });
    }
}

const editShortcut = () => {
    startEditingDescription();
    showContextMenu.value = false;
}

const duplicateShortcut = () => {
    emit('duplicate', props.shortcut);
    showContextMenu.value = false;
}

const removeShortcut = () => {
    emit('delete', props.shortcut.id);
    showContextMenu.value = false;
}

const focusKeyInput = () => { keyInput.value.focus(); }
const focusDescInput = () => { descriptionInput.value.focus(); }

const onDescBlur = (event) => {
    if (event.relatedTarget !== keyInput.value) saveDescription();
}

const onKeyBlur = (event) => {
    if (event.relatedTarget !== descriptionInput.value) saveKey();
}
</script>

<style scoped>
.row::before {
    content: '';
    position: absolute;
    width: 100%;
    top: 50%;
    z-index: 1;
    height: 1px;

    transition: border-bottom 0.3s ease-in-out;
    border-bottom: 1px dashed #d1d5db;
    /* gray-300 */
}

.editingRow::before {
    border-bottom: 1px dashed transparent;
}

.editing input {
    width: 100%;
    padding: 0px;
    border: none;
    outline: none;
    font-size: inherit;
    background-color: transparent;
}

.label {
    z-index: 10;
}
</style>