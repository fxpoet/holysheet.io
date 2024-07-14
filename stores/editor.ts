import { defineStore } from 'pinia'

export const useEditorStore = defineStore('editor', () => {

    const isEditing = ref(false)

    function edit() { isEditing.value = true }
    function editDone() { isEditing.value = false }

    function toggleEdit() {
        isEditing.value = !isEditing.value
    }

    //const doubleCount = computed(() => count.value * 2)

    return {
        isEditing,
        edit,
        editDone,
        toggleEdit
        //count, increment, decrement, doubleCount
    }
})