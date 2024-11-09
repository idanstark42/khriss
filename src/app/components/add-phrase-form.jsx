'use client'

import React, { useState } from 'react'

export default function AddPhraseForm () {
  const [phrase, setPhrase] = useState('')
  const [type, setType] = useState('success')
  const [meaning, setMeaning] = useState('')
  const [loading, setLoading] = useState(false)

  return <div className='add-phrase-form'>
    <input type='text' placeholder='Phrase' value={phrase} onChange={e => setPhrase(e.target.value)} />
    <select value={type} onChange={e => setType(e.target.value)}>
      <option value=''>Select type</option>
      <option value='auto-response'></option>
      <option value='warning'>Warning</option>
      <option value='info'>Info</option>
    </select>
    <input type='text' placeholder='Meaning' value={meaning} onChange={e => setMeaning(e.target.value)} />
    <button disabled={loading} onClick={async () => {
      setLoading(true)
      await fetch('/api/phrases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase, type, meaning })
      })
      setLoading(false)
    }}>
      {loading ? 'Loading...' : 'Add Phrase'}
    </button>
  </div>
}