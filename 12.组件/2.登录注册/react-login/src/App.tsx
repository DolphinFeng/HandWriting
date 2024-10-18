import React, { useState } from 'react';

const App: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleLogin = () => {
    setModalMessage(`登录成功\n用户名: ${username}\n密码: ${password}`);
    setShowModal(true);
  };

  return (
    <>
      <div>
        <h1>登录</h1>
        <div className="form">
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>登录</button>
        </div>
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>
              X
            </span>
            <p>{modalMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default App;