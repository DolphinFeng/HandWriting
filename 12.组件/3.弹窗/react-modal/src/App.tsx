import React, { useState } from 'react';

const App = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const openModal = () => {
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
  };

  const submit = () => {
    if (selectedOption) {
      console.log('Selected option:', selectedOption);
      closeModal();
    } else {
      alert('请选择一个选项');
    }
  };

  const options = ["JavaScript", "Python", "Java", "C++"];

  const styles = {
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      background: 'white',
      padding: '20px',
      borderRadius: '5px',
    },
    ul: {
      padding: 0,
      listStyle: 'none',
    },
    li: {
      margin: '10px 0',
    },
    button: {
      margin: '10px',
    },
  };

  return (
    <div>
      <button onClick={openModal}>打开弹窗</button>
      {isVisible && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>你最喜欢的编程语言是什么？</h3>
            <ul style={styles.ul}>
              {options.map((option, index) => (
                <li key={index} style={styles.li}>
                  <label>
                    <input
                      type="radio"
                      value={option}
                      checked={selectedOption === option}
                      onChange={(e) => setSelectedOption(e.target.value)}
                    />
                    {option}
                  </label>
                </li>
              ))}
            </ul>
            <button style={styles.button} onClick={submit}>提交</button>
            <button style={styles.button} onClick={closeModal}>关闭</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;