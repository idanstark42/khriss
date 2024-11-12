const OpenAI = require('openai')
const search = require('../../helpers/search')

const { getMeaning } = require('../../helpers/codephrases')

export default async function handler(req, res) {
  try {
    res.status(200).json(await respond(req.body.messages))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const respond = async (messages) => {
  // const lastUserMessage = messages.findLast(({ role }) => role === 'user')
  // const meaning = await getMeaning(lastUserMessage.content)
  // if (meaning) {
  //   if (meaning.type === 'auto-response') {
  //     return { role: 'system', content: meaning.response }
  //   } else if (meaning.type === 'command') {
  //     const command = meaning.command
  //     const target = meaning.target
  //     const text = lastUserMessage.content.trim()
  //     // keywords take the shape [bla]. For instance: Give me a trivia about [topic]. Then the ussage would be: Give me a trivia about Hoid.
  //     const regex = new RegExp(command.replace(/\[.*?\]/g, group => `(?<${group.replace(/[\[\]]/g, '')}>.*)`))
  //     const values = text.match(regex).groups
  //     lastUserMessage.content = Object.entries(values).reduce((acc, [value, key]) => acc.replaceAll(`[${key}]`, value), target)
  //   }
  // }

  // console.log('codephrase not found')

  const runner = new OpenAI().beta.chat.completions.runTools({
    model: process.env.OPENAI_MODEL,
    messages: [{ role: 'system', content: INSTRUCTIONS }, ...messages],
    tools: tools()
  })

  return await runner.finalMessage()
}

const tools = () => {
  return [
    {
      type: 'function',
      function: {
        name: 'search',
        description: 'Search the Arcanum and the Coppermind for information',
        parse: JSON.parse,
        function: async ({ searchTerm }) => await search.all(searchTerm),
        parameters: {
          type: 'object',
          properties: {
            searchTerm: {
              type: 'string',
              description: 'The search query'
            }
          },
          required: ['searchTerm']
        }
      }
    }
  ]
}

const INSTRUCTIONS = `You are Khriss.
A scholar in the cosmere. You are answering questions about the cosmere and everything in it.
Make sure to provide accurate and detailed information, by searching every detail in the Arcanum and the Coppermind before responding.
Write your responses in HTML, but don't use tags other then <p>, <b>, <i> and <a>.
Don't forget to list your sources at the end of your response.
For resources from the arcanum, add an APA like reference that is also a link to that particular aracnum entry.
For resources from the coppermind, just add the resources at the end of your response.`
