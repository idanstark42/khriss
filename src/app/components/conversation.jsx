'use client'

import { useEffect, useRef, useState } from 'react'
import { LuSendHorizonal } from 'react-icons/lu'
import { PulseLoader } from 'react-spinners'

export default function Conversation() {
  const [messages, setMessages] = useState([])
  const [lastMessage, setLastMessage] = useState(undefined)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [allowInput, setAllowInput] = useState(true)
  const [useArcanum, setUseArcanum] = useState(false)
  const messagesEndRef = useRef(null) // Ref for scrolling

  // Function to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom() // Scroll whenever messages change
  }, [messages])

  useEffect(() => {
    if (lastMessage && lastMessage.done) {
      setMessages([...messages, lastMessage])
      setLastMessage(undefined)
    }
  }, [lastMessage]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (message) => {
    if (!message) {
      message = input
      setInput('')
      setAllowInput(false)
    }
    const newMessages = [...messages, { role: 'user', content: message }]
    setMessages(newMessages)
    setLastMessage({ role: 'assistant', content: '' })
    setLoading(true)

    try {
      const response = await fetch('/api/khriss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let done = false
      while (!done) {
        const { value, done: streamDone } = await reader.read()
        done = streamDone

        if (value) {
          const chunk = decoder.decode(value)
          const lines = chunk.trim().split('\n')
          lines.forEach((line) => {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.replace('data: ', ''))
              if (data.delta) {
                setLastMessage(old => ({ role: 'assistant', content: old.content + data.delta }))
                setLoading(false)
              }
            }
          })
        }
      }
    } catch (error) {
      console.error('Error streaming messages:', error)
    } finally {
      setAllowInput(true)
      setLastMessage(old => ({ ...old, done: true }))
    }
  }

  return (
    <div id='conversation'>
      {messages.length > 0 ? (
        <div id='messages'>
          {(lastMessage ? [...messages, lastMessage] : messages).map((message, i) => (
            <div
              key={i}
              className={message.role}
              dangerouslySetInnerHTML={{ __html: message.content }}
            />
          ))}
          {loading && (
            <div className='message assistant'>
              <PulseLoader color='#ffffffaa' speedMultiplier={0.5} />
            </div>
          )}
          <div ref={messagesEndRef} /> {/* Element to scroll to */}
        </div>
      ) : (
        <div id='suggestions'>
          {Conversation.SUGGESTIONS.map((suggestion) => (
            <div
              key={suggestion}
              className='suggestion'
              onClick={() => submit(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
      <div id='input'>
        <input
          type='text'
          id='message'
          value={input}
          disabled={!allowInput}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => (e.key === 'Enter' ? submit() : null)}
        />
        <div id='send' onClick={() => submit()}>
          <LuSendHorizonal />
        </div>
      </div>
    </div>
  )
}

Conversation.SUGGESTIONS = [
  'Tell me about highstorms',
  'Explain the three realms',
  'Who is Hoid?'
]
