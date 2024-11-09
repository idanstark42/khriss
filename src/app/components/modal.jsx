'use client'

import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'

export default function Modal ({ children, button }) {
  const [open, setOpen] = useState(false)

  if (open) {
    return <div className='modal-button' onClick={() => setOpen(true)}>{button}</div>
  }

  return <div className='modal'>
    <div className='close-button' onClick={() => setOpen(false)}><FaTimes /></div>
    {children}
  </div>
}