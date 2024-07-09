import admin from 'firebase-admin';
import serviceAccount from '../../holysheet-f224c-firebase-adminsdk-bkffv-2066287c09.json';

if (!admin.apps.length) {
    admin.initializeApp({
        //@ts-ignore
        credential: admin.credential.cert(serviceAccount),
    });
}
const db = admin.firestore();

export default defineEventHandler(async (event) => {
    const method = event.node.req.method;

    if (method === 'GET') {
        // GET 요청 처리
        const query = getQuery(event);
        const id = query.id as string;

        if (!id) {
            throw createError({ statusCode: 400, message: 'ID가 제공되지 않았습니다.' });
        }

        try {
            const docRef = db.collection('sheets').doc(id);
            const doc = await docRef.get();

            if (!doc.exists) {
                throw createError({ statusCode: 404, message: '문서를 찾을 수 없습니다.' });
            }

            return { success: true, data: doc.data() };

        } catch (error) {
            throw createError({ statusCode: 500, message: '문서 조회 중 오류가 발생했습니다.', cause: error });
        }

    } else if (method === 'POST') {
        // POST 요청 본문에서 데이터 읽기
        const body = await readBody(event);

        try {
            const docRef = await db.collection('sheets').add(body);
            return { success: true, id: docRef.id };

        } catch (error) {
            throw createError({ statusCode: 500, message: '데이터 저장 중 오류가 발생했습니다.', cause: error });
        }
    } else {
        throw createError({ statusCode: 405, message: '허용되지 않는 메소드입니다.' });
    }
});