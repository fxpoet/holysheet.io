import Anthropic from "@anthropic-ai/sdk"
import { useRuntimeConfig } from '#imports'

const config = useRuntimeConfig()
const API_KEY = config.claudeKey // .env 파일의 CLAUDE_KEY 값을 사용합니다
console.log('API_KEY', API_KEY);

const anthropic = new Anthropic({ apiKey: API_KEY });

async function ask(question: string) {

    const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 3000,
        temperature: 0,
        system: `너는 프로그램의 단축키 정보를 제공하는 봇이다.
    1) 제공방식은 JSON으로 응답한다. JSON 데이터외에 다른 응답은 하지 않는다.
    2) 모르는 경우는 빈 값으로 메세지를 보낸다.
    3) 자주 쓰이는 중요한 순서대로 제공한다.
    4) 최대한 많이 제공한다.
    5) 응답은 어레이 [] 로 시작한다.

    #예시
    질문: 포토샵.
    응답: [{
    name: '일반',
    shortcuts: [
        { key: 'Ctrl+C', description: '복사' },
        { key: 'Ctrl+V', description: '붙여넣기' }
    ]
    },
    {
    name: '편집',
    shortcuts: [
        { key: 'Ctrl+Z', description: '실행 취소' },
        { key: 'Ctrl+Y', description: '다시 실행' }
    ]
    }]`,
        messages: [{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": question
                }
            ]
        }
        ]
    });

    return msg;
}

export default defineEventHandler(async (event) => {

    const query = getQuery(event)
    const question = (query.question as string)|| '';
    console.log('askClaude', question)

    if (!question)
        throw createError({ statusCode: 400, message: '질문이 필요합니다.' });

    try {
        let r = await ask(question).catch(err => err)
        console.log('r:', r)
        return r;
    } catch (error) {
        throw createError({ statusCode: 500, message: 'Claude API 호출 중 오류가 발생했습니다.' })
    }
})