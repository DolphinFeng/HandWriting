import React, { useState } from 'react'

export default function App () {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  const handleClick = () => {
    setShowModal(true)
    setModalMessage(`用户名：${username}密码：${password}`)
  }

  return (
    <>
      <div className="form">
        <input type="text" placeholder='用户名' value={username} onChange={e => setUsername(e.target.value)}/>
        <input type="password" placeholder='密码' value={password} onChange={e => setPassword(e.target.value)}/>
        <button onClick={handleClick}>提交</button>
      </div>
      {showModal && (
        <div className="modal">
          <button onClick={() => setShowModal(false)}>x</button>
          {modalMessage}
        </div>
      )}
    </>
  )
}