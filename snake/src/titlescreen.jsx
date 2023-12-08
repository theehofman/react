import "./Board.css"
import BlockDescription from "./Blockdescription"


function TitleScreen({ setGameStatus, title, handleStart }) {
    return (
      <div className="title-screen">
        <h1>{title}</h1>
        <BlockDescription/>
        <button className="btn-pink button-23" onClick={handleStart}>Play</button>
      </div>
    )
  }
  
  export default TitleScreen