<template>
    <div class="p-4">
        <div class="groups-container mx-auto" :style="{ width: containerWidth + 'px' }">

            <div class="flex gap-1 justify-center py-2">
                <div class="flex-1 justify-start">
                    <UButton icon="i-heroicons-pencil" :color="editMode ? 'green' : 'gray'" size="xs" @click="toggleEditMode"  />
                    <UButton v-if="editMode" icon="i-heroicons-plus-small-solid" color="gray" size="xs" @click="addNewGroup" class="ml-2" />
                </div>
                <div class="flex-1 justify-center flex">
                    <UButton color="white" variant="solid" icon="i-heroicons-sparkles" class="yellow-icon"
                        _click="openModal" @click="openModal">Generate with Claude</UButton>
                </div>
                <div class="flex-1 flex justify-end">
                    <UColorModeButton class="mr-2" />
                    <UButton icon="i-heroicons-qr-code" color="gray" size="xs" @click="generateQR" />
                </div>
            </div>

        </div>


        <div class="groups-container mx-auto max-w-full" ref="groupsContainer" :style="{ width: containerWidth + 'px' }">

            <VueDraggableNext :list="groups" item-key="id" :group="{ name: 'groups' }" :disabled="!editMode">
                <ShortcutGroup v-for="element in groups" :group="element" :edit-mode="editMode" @add-shortcut="addShortcut"
                    @update-group="updateGroup" />
            </VueDraggableNext>

            <div class="resize-handle" @mousedown="startResize"></div>
        </div>


        <UModal v-model="isModalOpen" class="aaa">
            <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <div class="p-0">
                    <UTextarea v-model="question" placeholder="어떤 프로그램을 원하세요?" class="w-full" :rows="2" />
                </div>

                <template #footer>
                    <div class="flex justify-end space-x-2">
                        <UButton color="gray" label="취소" @click="isModalOpen = false" />
                        <UButton color="blue" label="질문하기" @click="submitQuestion" />
                    </div>
                </template>
            </UCard>
        </UModal>

        <UModal v-model="isLoading">
            <UCard>
                <div class="p-4 text-center">
                    <p class="p-3">Loading...</p>
                    <UProgress animation="carousel" />
                </div>
            </UCard>
        </UModal>

        <UModal v-model="isQRModalOpen">
            <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
                <div class="p-4 text-center">
                    <img :src="qrCodeUrl" alt="QR Code" class="mx-auto" />
                    <p class="mt-2 cursor-pointer text-blue-500 hover:text-blue-700" @click="copyLinkUrl">
                        {{ linkUrl }}
                    </p>
                </div>
                <template #footer>
                    <div class="flex justify-end">
                        <UButton color="gray" label="닫기" @click="isQRModalOpen = false" />
                    </div>
                </template>
            </UCard>
        </UModal>
    </div>
</template>

<script lang="ts" setup>
import { VueDraggableNext } from 'vue-draggable-next'
import { customAlphabet } from 'nanoid'
import QRCode from 'qrcode'

const generateShortUUID = customAlphabet('1234567890abcdef', 8)

type Shortcut = {
    id?: number;
    key: string;
    description: string;
}

type Group = {
    id?: number;
    name: string;
    shortcuts: Shortcut[];
}

const groups = ref<Group[]>([
    {
        id: 1,
        "name": "일반",
        "shortcuts": [
            { id: 10, "key": "Ctrl+C", "description": "선택한 셀 복사" },
            { id: 11, "key": "Ctrl+V", "description": "복사한 셀 붙여넣기" },
            { id: 12, "key": "Ctrl+X", "description": "선택한 셀 잘라내기" },
            { id: 13, "key": "Ctrl+Z", "description": "실행 취소" },
            { id: 14, "key": "Ctrl+Y", "description": "다시 실행" },
            { id: 15, "key": "Ctrl+S", "description": "파일 저장" },
            { id: 16, "key": "F2", "description": "선택한 셀 편집" }
        ]
    },
    {
        id: 2,
        "name": "셀 서식2",
        "shortcuts": [
            { id: 22, "key": "Ctrl+B", "description": "굵게" },
            { id: 23, "key": "Ctrl+I", "description": "기울임꼴" },
            { id: 24, "key": "Ctrl+U", "description": "밑줄" }
        ]
    },
    {
        id: 3,
        "name": "데이터 관리",
        "shortcuts": [
            { id: 31, "key": "Ctrl+F", "description": "찾기" },
            { id: 32, "key": "Ctrl+H", "description": "바꾸기" },
            { id: 33, "key": "F5", "description": "셀로 이동" },
            { id: 34, "key": "Ctrl+Shift+L", "description": "필터 켜기/끄기" }
        ]
    },
    {
        id: 4,
        "name": "수식",
        "shortcuts": [
            { id: 41, "key": "Alt+=", "description": "자동 합계" },
            { id: 42, "key": "F4", "description": "수식에서 절대 참조와 상대 참조 전환" },
            { id: 43, "key": "F9", "description": "수식 계산" }
        ]
    }
]);

const isModalOpen = ref(false)
const question = ref('')
const docId = ref('')

const loadDoc = async (id: string) => {
    try {
        const response = await $fetch('/api/firebase', {
            method: 'GET',
            params: { id }
        }).catch(err => err);

        if (response.success) {
            //@ts-ignore
            console.log('문서 로드 성공:', response.data);
            //@ts-ignore
            groups.value = response.data.groups;
            // 로드된 groups를 savedGroups에 저장
            try {
                savedGroups.value = JSON.parse(JSON.stringify(response.data.groups));
            } catch (err) {
                console.error(err)
                alert('로드실패')
            }
        }
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
    }
}

const savedGroups = ref<Group[]>([])

const saveDoc = async () => {
    // 현재 groups와 savedGroups를 비교
    if (JSON.stringify(groups.value) === JSON.stringify(savedGroups.value)) {
        console.log('변경사항 없음, 저장 건너뜀');
        return;
    }

    try {
        const dataToSave = {
            groups: groups.value,
            timestamp: new Date().toISOString()
        };

        const response = await $fetch('/api/firebase', {
            method: 'POST',
            body: dataToSave
        });

        if (response.success) {
            //@ts-ignore
            console.log('데이터가 성공적으로 저장되었습니다. 문서 ID:', response.id);
            //@ts-ignore
            docId.value = response.id;
            // 저장된 groups 업데이트
            savedGroups.value = JSON.parse(JSON.stringify(groups.value));
        } else {
            console.error('데이터 저장 실패');
        }
    } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
    }
}


onMounted(async () => {
    const route = useRoute()
    let id = route.params.id as string
    if (id) await loadDoc(id);

    // 뷰포트 너비를 감지하여 containerWidth 설정
    if (window.innerWidth <= 400) {
        containerWidth.value = window.innerWidth;
    }
})


const openModal = async () => {
    isModalOpen.value = true;
}

const isLoading = ref(false)

const submitQuestion = async () => {
    if (question.value.trim()) {
        isModalOpen.value = false
        isLoading.value = true

        try {
            const response = await $fetch('/api/askClaude', {
                method: 'GET',
                params: { question: question.value }
            })

            question.value = ''

            console.log('Claude 응답:', response.content[0].text.trim())
            try {
                groups.value = buildKeySets(response.content[0].text);
            } catch (err) {
                console.log('err:', err);
                alert('적용실패')
            }

        } catch (error) {
            console.error('API 호출 오류:', error)
        } finally {
            isLoading.value = false
        }
    }
}

const buildKeySets = (keyData: string) => {

    let keys = JSON.parse(keyData.trim())

    keys.forEach((group: any) => {
        if (!group.id) {
            group.id = generateShortUUID()
        }
        group.shortcuts.forEach((shortcut: any) => {
            if (!shortcut.id) {
                shortcut.id = generateShortUUID()
            }
        })
    })

    return keys;
}


const groupsContainer = ref<HTMLElement | null>(null)
const containerWidth = ref(400) // 초기 너비 설정

const addNewGroup = () => {
    const newId = Math.max(0, ...groups.value.map(g => g.id ?? 0)) + 1
    groups.value.push({ id: newId, name: '새 그룹', shortcuts: [] })
}

const addShortcut = (groupId: number) => {
    const group = groups.value.find(g => g.id === groupId)
    if (group) {
        const newId = Math.max(0, ...group.shortcuts.map(s => s.id ?? 0)) + 1
        group.shortcuts.push({ id: newId, key: '새 단축키', description: '설명을 입력하세요' })
    }
}

const updateGroup = (updatedGroup: Partial<Group>) => {
    const index = groups.value.findIndex(g => g.id === updatedGroup.id)
    if (index !== -1) {
        groups.value[index] = { ...groups.value[index], ...updatedGroup }
    }
}

const editMode = ref(false)

const toggleEditMode = () => {
    editMode.value = !editMode.value
}

const startResize = (e: MouseEvent) => {
    e.preventDefault(); // 이벤트 기본 동작 방지
    const startX = e.clientX;
    const startWidth = containerWidth.value;

    const resize = (e: MouseEvent) => {
        e.preventDefault(); // 마우스 이동 중 텍스트 선택 방지
        if (e.buttons === 0) {
            stopResize();
            return;
        }
        const diff = e.clientX - startX;
        containerWidth.value = startWidth + diff;
    };

    const stopResize = () => {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
        document.body.style.userSelect = ''; // 텍스트 선택 기능 복원
    };

    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);
    document.body.style.userSelect = 'none'; // 텍스트 선택 기능 비활성화
};



const isQRModalOpen = ref(false)
const qrCodeUrl = ref('')
const linkUrl = ref('')

const generateQR = async () => {
    try {
        await saveDoc()
        if (docId.value) {
            const url = `${window.location.origin}/a/${docId.value}`
            linkUrl.value = url;
            qrCodeUrl.value = await QRCode.toDataURL(url)

            isQRModalOpen.value = true
        } else {
            console.error('문서 ID를 가져오지 못했습니다.')
        }
    } catch (error) {
        console.error('QR 코드 생성 중 오류 발생:', error)
    }
}

const copyLinkUrl = () => {
    navigator.clipboard.writeText(linkUrl.value)
        .then(() => {
            alert('링크가 클립보드에 복사되었습니다.')
        })
        .catch(err => {
            console.error('클립보드 복사 실패:', err)
            alert('링크 복사에 실패했습니다.')
        })
}
</script>

<style>
.groups-container {
    display: flex;
    overflow-x: auto;
    position: relative;
    width: 100%; /* 기본값 설정 */
}

.groups-container>div:not(.resize-handle) {
    width: 100%;
}

.resize-handle {
    width: 4px;
    height: 100%;
    background-color: transparent;
    cursor: ew-resize;
    position: absolute;
    right: 0;
    top: 0;
}

.resize-handle:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

:deep(.i-heroicons-sparkles) {
    color: #ffd01e;
    /*animation: sparkle 3.5s infinite;*/
}

@keyframes sparkle {
    0% {
        opacity: 1;
        transform: scale(-1);
    }

    50% {
        opacity: 0.5;
        transform: scale(1);
    }

    100% {
        opacity: 1;
        transform: scale(-1);
    }
}
</style>