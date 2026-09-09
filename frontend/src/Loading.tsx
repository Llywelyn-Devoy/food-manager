import { useEffect, useState } from 'react';
import './Loading.css'

function Spinner() {
  return (
    // TODO: make screen reader compatible
    <div className="common spinner">
      <div className="flipped">
        🛒
      </div>
    </div>
  )
}

function SideToSider() {
  return (
    // TODO: make screen reader compatible
    <div className="common side-to-sider">
      <div className="flipped">
        🛒
      </div>
    </div>
  )
}

function Loading({ children, isLoaded, showForAtleast = 1000 }) {
  let [isTimerUp, setIsTimerUp] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimerUp(true);
    }, showForAtleast);
    return () => clearTimeout(timer);
  }, [showForAtleast]);

  return isTimerUp && isLoaded ? children : <SideToSider />;
}

export default Loading
