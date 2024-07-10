import Anthropic from "@anthropic-ai/sdk"

import { useRuntimeConfig } from '#imports'
const config = useRuntimeConfig()
const API_KEY = config.CLAUDE_KEY

const anthropic = new Anthropic({ apiKey: API_KEY });

const prompt = `You are a bot that provides shortcut information for software.
Rule 1) You provide the information in JSON format. The response is in JSON format only.
Rule 2) If you do not know, send an empty value.
Rule 3) Provide the information in the order of importance.
Rule 4) Provide as much as possible.
Rule 5) The response starts with an array [].
Rule 6) If the input is not English, provide the information in the language of the input.
Rule 7) Common general shortcuts such as Copy, Undo, and Save are excluded.

#Example
Question: Photoshop.
Response: [{ name: 'General',
shortcuts: [
    { key: 'Ctrl+C', description: 'Copy' },
    { key: 'Ctrl+V', description: 'Paste' }
]},{ name: 'Edit',
shortcuts: [
    { key: 'Ctrl+Z', description: 'Undo' }
]}]`

async function ask(question: string) {
    const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 3000,
        temperature: 0,
        system: prompt,
        messages: [{
            "role": "user",
            "content": [{ "type": "text", "text": question }]
        }]
    });
    return msg;
}

export default defineEventHandler(async (event) => {

    const query = getQuery(event)
    const question = (query.question as string)|| '';

    if (!question)
        throw createError({ statusCode: 400, message: '질문이 필요합니다.' });

    try {
        let r = await ask(question).catch(err => err)
        return r;

    } catch (error) {
        throw createError({ statusCode: 500, message: 'Claude API 호출 중 오류가 발생했습니다.' })
    }
})