'use client'

import { useChat } from 'ai/react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  const onSubmitHandler = (event) => {
    event.preventDefault()
    handleSubmit
  }
  
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <label>
          Say something...
          <input
            value={input}
            onChange={handleInputChange}
          />
        </label>
      </form>
    </div>
  )
}