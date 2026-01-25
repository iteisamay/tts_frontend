import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { styles } from '../style/style'
function Upload() {
  const [title, setTitle] = useState("");
  const [textToSpeech, setTextToSpeech] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [audioKey, setAudioKey] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [saveButnText, setSetsaveButnText] = useState("Save");
  const navigate = useNavigate();
  // State for selected text TTS playback
  const [selectedAudioUrl, setSelectedAudioUrl] = useState(null);
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [customPronunciation, setCustomPronunciation] = useState();
  const [selectCustomAddLoading, setSelectCustomAddLoading] = useState(false);
  const [speechWord, setSpeechWord] = useState("");
  const [speechPronunciation, setSpeechPronunciation] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("tts_currentUser"));
    const role = JSON.parse(localStorage.getItem("tts_currentUserRole"));
    if (user) {
      setCurrentUser(user);
    }
    if (role) {
      setCurrentUserRole(role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tts_currentUser");
    localStorage.removeItem("tts_currentUserRole");
    navigate("/login");
  };

  const enableCustomInput = () => {
    setCustomPronunciation(true);
  };

  const addCustomPronunciation = async () => {
    if(speechWord.trim()==="" || speechPronunciation.trim()===""){
      alert("Please fill required fields.");
      return;
    }
    setSelectCustomAddLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      const body = JSON.stringify({
        word: speechWord,
        speech: speechPronunciation,
        action:"create",
        user_code:currentUser
      });
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/tts/add/custom`, {
        method: 'POST',
        headers: myHeaders,
        body,
      });
      const data = await res.json();
      if (res.ok) {
        alert("Custom pronunciation added successfully");
        setSpeechWord("");
        setSpeechPronunciation("");
        setCustomPronunciation(false);
        setSelectCustomAddLoading(false);
      } else {
        alert(data.error || 'Error adding custom pronunciation');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding custom pronunciation');
    } finally {
      setSelectedLoading(false);
    }
  }
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

    useEffect(() => {
      const user = JSON.parse(localStorage.getItem("tts_currentUser"));
      const role = JSON.parse(localStorage.getItem("tts_currentUserRole"));
      if (user) {
        setCurrentUser(user);
      }
      if (role) {
        setCurrentUserRole(role);
      }
    }, []);

  const canUseTTS = () => {
    const limit = 3;
    const today = new Date().toISOString().split("T")[0];
    const usageData = JSON.parse(localStorage.getItem("ttsUsage")) || { date: today, count: 0 };

    // Reset count if it's a new day
    if (usageData.date !== today) {
      usageData.date = today;
      usageData.count = 0;
    }

    // limit reached
    if (usageData.count >= limit) {
      return false;
    }

    usageData.count += 1;
    localStorage.setItem("ttsUsage", JSON.stringify(usageData));
    return true;
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAudioUrl(null);
    setAudioBlob(null);

    const formData = new FormData(e.target);
    formData.append("user_code",currentUser);
    formData.append("action",'create');
    
    const payload = JSON.stringify(Object.fromEntries(formData));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKENDURL}/tts/create-speech-only`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        }
      );

      if (!response.ok) throw new Error("TTS service failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setAudioBlob(blob);
      setAudioUrl(url);

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };



  const saveDataToDB = async () => {
    if (!audioBlob) {
      alert("No audio to save");
      return;
    }

    setLoading2(true);
    setSetsaveButnText("Saving...");

    try {
      // 1️⃣ presigned url
      const { uploadUrl, audioKey } = await getPresignedUrl();
      console.log(uploadUrl, audioKey);
      // 2️⃣ upload directly to S3
      await uploadAudioToS3(uploadUrl, audioBlob);

      // 3️⃣ finalize (QR + DB)
      const res = await fetch(
        `${process.env.REACT_APP_BACKENDURL}/tts/finalize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            text: textToSpeech,
            audioKey
          })
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg || "Finalize failed");

      alert("Saved successfully");
      navigate("/tts/records");

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading2(false);
      setSetsaveButnText("Save");
    }
  };

  const saveDataToDBV2 = async () => {
    if (!audioBlob) {
      alert("No audio to save");
      return;
    }

    setLoading2(true);
    setSetsaveButnText("Saving...");

    const formdata = new FormData();
    formdata.append("title", title);
    formdata.append("text", textToSpeech);
    formdata.append("audio", audioBlob);
    formdata.append("user_code", currentUser);
    formdata.append("action", "create");

    try {
      const requestOptions = {
        method: "POST",
        body: formdata,
      };
      console.log("Reques obj: ", requestOptions);
      await fetch(
        `${process.env.REACT_APP_BACKENDURL}/tts/store`,
        requestOptions
      );

      alert("Saved successfully");
      navigate("/tts/records");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading2(false);
      setSetsaveButnText("Save");
    }


  }



  const getPresignedUrl = async () => {
    const res = await fetch(
      `${process.env.REACT_APP_BACKENDURL}/tts/get-audio-presigned-url`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!res.ok) throw new Error("Failed to get presigned URL");
    return res.json();
  };


  const uploadAudioToS3 = async (uploadUrl, audioBlob) => {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "audio/mp3"
      },
      body: audioBlob
    });

    if (!res.ok) throw new Error("S3 upload failed");
  };



  const handleInputFocus = (e) => {
    e.target.style.borderColor = "#3498db";
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = "#ddd";
  };

  const handleButtonHover = (e) => {
    e.currentTarget.style.backgroundColor = "#2980b9";
  };

  const handleButtonLeave = (e) => {
    e.currentTarget.style.backgroundColor = "#3498db";
  };
  const listenSelected = async (e) => {
    // Get selected text from the textarea
    const selectedText = document.getSelection().toString().trim();
    if (!selectedText) {
      alert('Please select some text to listen to');
      return;
    }
    setSelectedLoading(true);
    setSelectedAudioUrl(null)
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      const body = JSON.stringify({
        title: 'Selected Text',
        text: selectedText,
        voice: 'bn-IN-Wavenet-A',
        language: 'bn-IN',
        speakingRate: 1.0,
        pitch: 0.0,
        user_code:currentUser,
        action:"create"
      });
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/tts/create-speech-only`, {
        method: 'POST',
        headers: myHeaders,
        body,
      });
      if (!res.ok) throw new Error("TTS service failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      //
      setSelectedAudioUrl(url);
      setSelectedLoading(false);
    } catch (err) {
      console.error(err);
      alert('Error generating audio');
    } finally {
      setSelectedLoading(false);
    }
  }


  return (
    <div style={styles.container}>
      <Link
        to="/tts/records"
        style={{
          display: "inline-block",
          marginBottom: "20px",
          textDecoration: "none",
          background: "#2563eb",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "8px",
        }}
      >
        TTS Records
      </Link>
      <div style={{ display: "flex", gap: "10px", float: "right" }}>
        {currentUserRole === 'ADMIN' && (
          <Link
            to="/create-user"
            style={{
              textDecoration: "none",
              background: "#2ecc71",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "8px",
            }}
          >
            Add New User
          </Link>
        )}
        <button
          onClick={handleLogout}
          style={{
            background: "#e74c3c",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Logout
        </button>
      </div>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="title">
            Title<span style={styles.required}>*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={styles.input}
            name="title"
            required
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="textToSpeech">
            Text-to-speech<span style={styles.required}>*</span>
          </label>
          <textarea
            id="textToSpeech"
            value={textToSpeech}
            onChange={(e) => setTextToSpeech(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            style={styles.textarea}
            name="text"
            required
          />
        </div>
        <button
          type="button"
          style={styles.button}
          onClick={listenSelected}
        >
          {selectedLoading ? "Generating..." : "Listen selected"}
        </button>
        <div style={styles.audio_container}>
          {selectedAudioUrl && <audio controls>
            <source src={selectedAudioUrl} type="audio/mpeg" />
          </audio>}
        </div>
        <button
          type="button"
          style={styles.button}
          onClick={enableCustomInput}
        >
          {selectCustomAddLoading ? "Adding..." : "Add Custom Pronunciation"}
        </button>
        <div style={styles.audio_container}>
          {customPronunciation && <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input type="text" placeholder="Word" onChange={(e) => setSpeechWord(e.target.value)} style={styles.input} />
            <input type="text" placeholder="Custom Pronunciation" onChange={(e) => setSpeechPronunciation(e.target.value)} style={styles.input} />
            <button type="button" style={styles.button} onClick={addCustomPronunciation}>
              {selectCustomAddLoading ? "Adding..." : "Add Custom Pronunciation"}
            </button>
          </div>}
        </div>
        <button
          type="submit"
          style={styles.button}
          onMouseEnter={handleButtonHover}
          onMouseLeave={handleButtonLeave}
          disabled={loading}
        >
          {loading ? "Generating..." : "Submit"}
        </button>
      </form>

      {loading && <div style={styles.loader}>Processing... Please wait ⏳</div>}

      {audioUrl && (
        <div style={styles.imageContainer}>
          <audio controls>
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <button
            type="button"
            onClick={(e) => { saveDataToDBV2() }}
            style={styles.saveButton}
          >
            {saveButnText}
          </button>
        </div>
      )}
    </div>
  );
}

export default Upload;
