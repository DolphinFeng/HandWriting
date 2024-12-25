import React, { useState, useEffect } from 'react';

function CountdownCoupon() {
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCounting, setIsCounting] = useState(true);
  const [buttonText, setButtonText] = useState('等待抢券');

  useEffect(() => {
    if (timeLeft > 0 && isCounting) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsCounting(false);
      setButtonText('点击抢券');
    }
  }, [timeLeft, isCounting]);

  const handleCouponClick = () => {
    if (!isCounting) {
      // 模拟请求接口
      fetch('/api/grab-coupon')
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setButtonText('抢券成功');
          } else {
            setButtonText('抢券失败');
          }
        })
        .catch(() => {
          setButtonText('请求失败');
        });
    }
  };

  return (
    <div>
      <h1>倒计时抢券</h1>
      <p>倒计时: {timeLeft} 秒</p>
      <button onClick={handleCouponClick} disabled={isCounting}>
        {buttonText}
      </button>
    </div>
  );
}

export default CountdownCoupon; 