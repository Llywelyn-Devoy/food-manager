
import './Loading.css'

// function Spinner() {
//   return (
//     // TODO: make screen reader compatible
//     <div className="common spinner">
//       <div className="flipped">
//         🛒
//       </div>
//     </div>
//   )
// }

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

function Loading() {
  return <SideToSider />;
}

export default Loading
