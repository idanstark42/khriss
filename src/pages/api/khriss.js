const OpenAI = require('openai')
const search = require('../../helpers/search')

export default function handler(req, res) {
  const { messages } = req.body
  respond(messages)
    .then(response => res.status(200).json(response))
    .catch(error => res.status(500).json({ error: error.message }))
}

const respond = async (messages) => {
  return await new OpenAI().beta.chat.completions.runTools({
    model: process.env.OPENAI_MODEL,
    messages,
    tools: tools(),
    tool_choice: { type: 'function', function: { name: 'search' } },
    max_tokens: 200,
    temperature: 0.5,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: ['\n']
  })
}

const tools = () => {
  return [
    {
      type: 'function',
      function: {
        name: 'search',
        description: 'Search the Arcanum and the Coppermind for information',
        parse: JSON.parse,
        function: async ({ searchTerm }) => await search.all(searchTerm, true, false),
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
Make sure to provide accurate and detailed information, by searching every detail in the Arcanum and the Coppermind before responding.`
