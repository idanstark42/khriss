'use client'

import { useEffect, useState } from 'react'
import { LuSendHorizonal } from 'react-icons/lu'

export default function Conversation () {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const submit = async (message) => {
    if (!message) {
      message = input
      setInput('')
    }
    const newMessages = [...messages, { role: 'user', content: message }]
    setMessages(newMessages)
    const getResponseMessage = async () => {
      const response = await fetch('/api/khriss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })
      // setMessages([...newMessages, { role: 'system', content: response }])
    }
    getResponseMessage()
  }

  return <div id='conversation'>
    {messages.length > 0 ? <div id='messages'>
      {messages.map((message, i) => <div key={i} className={message.role}>{message.content}</div>)}
    </div> : <div id='suggestions'>
      {Conversation.SUGGESTIONS.map(suggestion => <div key={suggestion} className='suggestion' onClick={() => submit(suggestion)}>{suggestion}</div>)}
    </div>}
    <div id='input'>
      <input type='text' id='message' placeholder='You can ask anything about the cosmere' value={input} onChange={e => setInput(e.target.value)} />
      <div id='send'><LuSendHorizonal /></div>
    </div>
  </div>
}

Conversation.SUGGESTIONS = [
  'Tell me about highstorms',
  'Explain the three realms',
  'Who is Hoid?'
]
