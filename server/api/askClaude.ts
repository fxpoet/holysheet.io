import { askClaude } from '../../utils/claude';

export default defineEventHandler(async (event) => {

    const query = getQuery(event)
    const question = query.question || '';
    console.log('askClaude', question)

    if (!question)
        throw createError({ statusCode: 400, message: '질문이 필요합니다.' });

    try {
        let r = await askClaude(question).catch(err => err)
        console.log('r:', r)
        return r;
    } catch (error) {
        throw createError({ statusCode: 500, message: 'Claude API 호출 중 오류가 발생했습니다.' })
    }
})