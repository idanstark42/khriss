const OpenAI = require('openai')
const search = require('../../helpers/search')

const { getMeaning } = require('../../helpers/codephrases')

export default async function handler(req, res) {
  try {
    const messages = req.body.messages
    const databadeResponseMessages = await databadeResponse(messages)
    if (!(databadeResponseMessages instanceof Array)) {
      // got a response from the database. Return it.
      res.status(200).json(databadeResponseMessages)
    } else {
      for await (const chunk of stream(databadeResponseMessages)) {
        res.write(`data: ${JSON.stringify({ delta: chunk.choices[0].delta.content })}\n\n`)
      }
      res.end()
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const databadeResponse = async (messages) => {
  try{
    const lastUserMessage = messages.findLast(({ role }) => role === 'user')
    const meaning = await getMeaning(lastUserMessage.content)
    if (meaning) {
      if (meaning.type === 'auto-response') {
        return { role: 'system', content: meaning.response }
      } else if (meaning.type === 'command') {
        const command = meaning.command
        const target = meaning.target
        const text = lastUserMessage.content.trim()
        const regex = new RegExp(command.replace(/\[.*?\]/g, group => `(?<${group.replace(/[\[\]]/g, '')}>.*)`))
        const values = text.match(regex).groups
        lastUserMessage.content = Object.entries(values).reduce((acc, [value, key]) => acc.replaceAll(`[${key}]`, value), target)
      }
    }
  } catch (error) {
    console.error(error)
  }
  return messages
}

const stream = (messages) => {
  return new OpenAI().beta.chat.completions.runTools({
    model: process.env.KHRISS_OPENAI_MODEL,
    messages: [{ role: 'system', content: INSTRUCTIONS }, ...messages],
    tools: tools(),
    stream: true
  })
}

const tools = () => {
  return [
    {
      type: 'function',
      function: {
        name: 'searchCoppermind',
        description: 'Search the Coppermind',
        parse: JSON.parse,
        function: async ({ searchTerm }) => {
          const searchResults = await search.coppermind(searchTerm)
          if (searchResults.tokens) {
            delete searchResults.tokens
          }
          return searchResults
        },
        parameters: {
          type: 'object',
          properties: {
            searchTerm: {
              type: 'string',
              description: 'A single word/phrase to look for in the Arcanum'
            }
          },
          required: ['searchTerm']
        }
      }
    },
    {
      type: 'function',
      function: {
        name: 'searchArcanum',
        description: 'Search the arcanum',
        parse: JSON.parse,
        function: async ({ searchTerm }) => {
          const searchResults = await search.arcanum(searchTerm)
          if (searchResults.tokens) {
            delete searchResults.tokens
          }
          return searchResults
        },
        parameters: {
          type: 'object',
          properties: {
            searchTerm: {
              type: 'string',
              description: 'A single word/phrase to look for in the Coppermind'
            }
          },
          required: ['searchTerm']
        }
      }
    }
  ]
}

const INSTRUCTIONS = `You are Khriss, a scholar of the cosmere, answering questions about its vast lore and mysteries.
Always search the Coppermind for explanations, definitions, or general information unless told not to. Only search the Arcanum if:
You are asked a specific question requiring detailed clarification or quotes.
You cannot find the information on the Coppermind.
Do not search if the question asks for a summary or general overview, such as "Tell me about...".
Write your responses in HTML using only <p>, <b>, <i>, and <a> tags. List sources at the end:
For Coppermind, add the source title as plain text with a link to the article.
For Arcanum, use APA-style citations with links to the entry.`
