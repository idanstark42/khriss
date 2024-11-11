'use client'

import React, { useState } from 'react'

export default function AddPhraseForm () {
  const [phrase, setPhrase] = useState('')
  const [type, setType] = useState('text')
  const [meaning, setMeaning] = useState('auto-response')
  const [loading, setLoading] = useState(false)

  return <div className='add-phrase-form'>
  </div>
}