import { defineStore } from 'pinia'

export const useEditorStore = defineStore('editor', () => {

    const isEditing = ref(false)
    const containerWidth = ref(400)

    function edit() { isEditing.value = true }
    function editDone() { isEditing.value = false }
    function toggleEdit() {
        isEditing.value = !isEditing.value
    }

    const setContainerWidth = (width: number) => {
        containerWidth.value = width
    }

    return {
        isEditing,
        edit,
        editDone,
        toggleEdit,
        containerWidth,
        setContainerWidth
    }
})