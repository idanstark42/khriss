'use client'

import { useEffect, useState } from 'react'
import { LuSendHorizonal } from 'react-icons/lu'
import { PulseLoader } from 'react-spinners'

export default function Conversation () {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (message) => {
    if (!message) {
      message = input
      setInput('')
    }
    const newMessages = [...messages, { role: 'user', content: message }]
    setMessages(newMessages)
    setLoading(true)
    const getResponseMessage = async () => {
      const response = await fetch('/api/khriss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })
      const { role, content } = await response.json()
      setMessages([...newMessages, { role, content }])
      setLoading(false)
    }
    getResponseMessage()
  }

  return <div id='conversation'>
    {messages.length > 0 ? <div id='messages'>
      {messages.map((message, i) => <div key={i} className={message.role}  dangerouslySetInnerHTML={{__html: message.content}} />)}
      {loading && <div className='message assistant'><PulseLoader color='#ffffffaa' speedMultiplier={0.5} /></div>}
    </div> : <div id='suggestions'>
      {Conversation.SUGGESTIONS.map(suggestion => <div key={suggestion} className='suggestion' onClick={() => submit(suggestion)}>{suggestion}</div>)}
    </div>}
    <div id='input'>
      <input type='text' id='message' value={input} onChange={e => setInput(e.target.value)} />
      <div id='send'
        onClick={() => submit()}
        onKeyDown={e => e.key === 'Enter' && submit()} >
        <LuSendHorizonal />
      </div>
    </div>
  </div>
}

Conversation.SUGGESTIONS = [
  'Tell me about highstorms',
  'Explain the three realms',
  'Who is Hoid?'
]
