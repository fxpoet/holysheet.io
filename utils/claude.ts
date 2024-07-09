import Anthropic from "@anthropic-ai/sdk"

const API_KEY = process.env.CLAUDE_KEY;
console.log('API_KEY', API_KEY);
const anthropic = new Anthropic({ apiKey: API_KEY });

export async function askClaude(question: string) {

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
