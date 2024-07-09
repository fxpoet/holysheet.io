<template>
    <div class="shortcut-group
        relative w-full flex flex-col overflow-hidden rounded-lg
        border border-gray-200 dark:border-gray-700 shadow-md
        mb-4
        bg-white dark:bg-gray-900">

        <div class="flex p-3 bg-gray-50">

            <div v-if="editingName" class="group-name editing flex-grow mr-2">
                <input ref="nameInput" v-model="editedName" style="margin-top:2px;"
                    @blur="saveName" @keyup.enter="saveName">
            </div>

            <h2 v-else @dblclick="startEditingName" class="group-name flex-grow font-bold" style="line-height: 1.7rem;">
                {{ group.name }}
            </h2>

            <UButton icon="i-heroicons-plus-small-solid"
                class="flex-1 flex-grow-0"
                color="gray" size="xs"
                @click="$emit('add-shortcut', group.id)" />
        </div>

        <draggable :list="groupShortcuts" item-key="id" :group="{ name: 'shortcuts', pull: true, put: function(to, from) { return to.el.children.length === 0; } }"
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
    },

    emits: ['add-shortcut', 'update-group', 'resize', 'update', 'delete', 'duplicate'],

    setup(props, { emit }) {

        const groupShortcuts = ref(props.group.shortcuts)
        const editingName = ref(false)
        const editedName = ref(props.group.name)
        const nameInput = ref(null)

        watch(() => props.group.shortcuts, (newShortcuts) => {
            groupShortcuts.value = newShortcuts
        })

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

        const startEditingName = () => {
            editingName.value = true
            editedName.value = props.group.name
            nextTick(() => nameInput.value.focus())
        }

        const saveName = () => {
            editingName.value = false
            if (editedName.value !== props.group.name) {
                emit('update-group', { ...props.group, name: editedName.value })
            }
        }

        return {
            groupShortcuts,
            editingName,
            editedName,
            nameInput,
            handleChange,
            updateShortcut,
            deleteShortcut,
            duplicateShortcut,
            startEditingName,
            saveName,
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