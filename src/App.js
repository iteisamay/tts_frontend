import { Routes, Route } from "react-router";
import './App.css';
import Upload from './pages/Upload';
import TtsRecordList from './pages/TtsRecordList';

function App() {
  return (
    <Routes>
      <Route path="/tts/upload" element={<Upload/>} />
      <Route path="/tts/records" element={<TtsRecordList/>} />
    </Routes> 
  )
}

export default App;
