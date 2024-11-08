const OpenAI = require('openai')

exports.summarize = async (text, focusTerm) => {
  const chunks = chunk(text, 10000)
  const summaries = await Promise.all(chunks.map(chunk => summarizeChunk(chunk, focusTerm)))
  return summaries.map(summary => summary.choices[0].message.content).join('\n')
}

async function summarizeChunk (text, focusTerm) {
  return await new OpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [
      { role: 'system', content: instruction(text, focusTerm) },
      { role: 'user', content: text }
    ],
    max_tokens: 200,
    temperature: 0.5,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: ['\n']
  })
}

function chunk (text, chunkSize) {
  const chunks = []
  for (let i = 0; i < text.length; i += chunkSize) {
    if (i + chunkSize > text.length) {
      chunks.push(text.slice(i))
      break
    }
    chunks.push(text.slice(i, i + chunkSize))
  }
  return chunks
}

function instruction (text, focusTerm) {
  return `I'm going to give youa text and you should summarize it, focusing on a specific search term.
    The text is either a bunch of Q&A from the Arcanum or an article from the Coppermind wiki.
    You should select only the relevant parts and summarize them.
    If any part of the text is irrelevant, ignore it.
    If the entire text is irrelevant, return "undefined".
    The search term is: ${focusTerm}.`
}
