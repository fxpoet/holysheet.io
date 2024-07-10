<template>
    <div class="shortcut-group
        relative w-full flex flex-col overflow-hidden rounded-lg
        border border-gray-300 dark:border-gray-800 shadow-lg
        bg-white dark:bg-gray-900" :class="isCollapsed ? 'mb-1 shadow-sm' : 'mb-4 shadow-lg'">

        <div class="flex p-3 bg-gray-100 cursor-pointer" @click="toggleCollapse">

            <div v-if="editMode" class="group-name editing flex-grow mr-2" @click.stop>
                <input ref="nameInput" v-model="editedName" style="margin-top:-2px;max-width: 150px;"
                    @blur="saveName" @keyup.enter="saveName">
            </div>

            <h2 v-else class="group-name flex-grow font-bold">
                {{ group.name }}
            </h2>

            <UButton v-if="editMode"
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

        <draggable v-show="!isCollapsed" :list="groupShortcuts" item-key="id" :group="{ name: 'shortcuts', pull: true, put: function(to, from) { return to.el.children.length === 0; } }"
            class="p-4 pt-4 bg-white-800"
            @change="handleChange">

            <template v-for="element in groupShortcuts">
                <ShortcutItem :shortcut="element" @update="updateShortcut" @delete="deleteShortcut" @duplicate="duplicateShortcut" />
            </template>

        </draggable>
    </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
import ShortcutItem from './ShortcutItem.vue'

export default {

    name: 'ShortcutGroup',

    components: {
        draggable: VueDraggableNext,
        ShortcutItem
    },

    props: {
        group: { type: Object, required: true },
        editMode: { type: Boolean, default: false },
    },

    emits: ['add-shortcut', 'update-group', 'resize', 'update', 'delete', 'duplicate'],

    setup(props, { emit }) {

        const groupShortcuts = ref(props.group.shortcuts)
        const editedName = ref(props.group.name)
        const nameInput = ref(null)
        const isCollapsed = ref(false)

        //watch(() => props.editMode, (newEditMode) => {
        //    if (newEditMode) {
        //        editedName.value = props.group.name
        //        nextTick(() => nameInput.value?.focus())
        //    }
        //})

        const saveName = () => {
            if (editedName.value !== props.group.name) {
                emit('update-group', { ...props.group, name: editedName.value })
            }
        }

        const handleChange = () => {
            emit('update-group', { ...props.group, shortcuts: groupShortcuts.value })
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

        const duplicateShortcut = (shortcut) => {
            const newShortcut = { ...shortcut }
            groupShortcuts.value.push(newShortcut)
            handleChange()
        }

        const toggleCollapse = () => {
            isCollapsed.value = !isCollapsed.value
            emit('resize')
        }

        return {
            groupShortcuts,
            editedName,
            nameInput,
            saveName,
            handleChange,
            updateShortcut,
            deleteShortcut,
            duplicateShortcut,
            isCollapsed,
            toggleCollapse,
        }
    }
}
</script>

<style scoped>
.editing input {
    width: 100%;
    font-size: 1em;
    outline: 1px solid #ccc;
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