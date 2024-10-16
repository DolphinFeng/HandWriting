import React, { useState } from 'react'

const App: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')

  const handleLogin = () => {
    setShowModal(true)
    setModalMessage(`账号：${username} \n密码：${password}`)
  }
  return (
    <>
      <div className="form">
        <input type="text" placeholder='用户名' value={username} onChange={(e) => setUsername(e.target.value)}/>
        <input type="password" placeholder='密码' value={password} onChange={(e) => setPassword(e.target.value)}/>
      </div>
      <button onClick={handleLogin}>提交</button>
      {showModal && (
        <div className="modal">
          <span onClick={() => setShowModal(false)}>X</span>
          <p>{modalMessage}</p>
        </div>
      )}
    </>
  )
}

export default App