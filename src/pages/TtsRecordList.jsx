import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

function TtsRecordList() {
  const styles = {
    container: {
      maxWidth: "600px",
      margin: "50px auto",
      padding: "30px",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    fieldGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#333",
    },
    required: {
      color: "#e74c3c",
      marginLeft: "4px",
    },
    input: {
      padding: "10px 12px",
      fontSize: "16px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      outline: "none",
      transition: "border-color 0.2s",
    },
    textarea: {
      padding: "10px 12px",
      fontSize: "16px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      outline: "none",
      minHeight: "120px",
      resize: "vertical",
      fontFamily: "inherit",
      transition: "border-color 0.2s",
    },
    button: {
      padding: "12px 24px",
      fontSize: "16px",
      fontWeight: "500",
      color: "#ffffff",
      backgroundColor: "#3498db",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
      marginTop: "10px",
    },
    loader: {
      marginTop: "20px",
      textAlign: "center",
      fontWeight: "500",
      color: "#3498db",
    },
    imageContainer: {
      textAlign: "center",
      marginTop: "30px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    image: {
      width: "200px",
      height: "200px",
      objectFit: "contain",
      border: "1px solid #ddd",
      borderRadius: "8px",
    },
    downloadBtn: {
      display: "inline-block",
      marginTop: "15px",
      padding: "10px 20px",
      backgroundColor: "#2ecc71",
      color: "#fff",
      textDecoration: "none",
      borderRadius: "4px",
      fontWeight: "500",
    },
    saveButton: {
      display: "inline-block",
      marginTop: "15px",
      padding: "10px 20px",
      backgroundColor: "#2a89d1ff",
      color: "#fff",
      textDecoration: "none",
      borderRadius: "4px",
      fontWeight: "500",
    },
    audio_container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }
  };
  const [records, setRecords] = useState([]);
  const [pageLength, setPageLength] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Update Modal State
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [updateText, setUpdateText] = useState("");
  const [updating, setUpdating] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showFullTextModal, setShowFullTextModal] = useState(false);
  const [fullTextContent, setFullTextContent] = useState("");
  const [fullTextTitle, setFullTextTitle] = useState("");

  // Listen Modal State (Removed) - refactoring to Update Modal
  const [selectedListenUrl, setSelectedListenUrl] = useState(null);
  const [selectedListenLoading, setSelectedListenLoading] = useState(false);
  const updateTextareaRef = useRef(null);

  const [customPronunciation, setCustomPronunciation] = useState(false);
  const [speechWord, setSpeechWord] = useState("");
  const [speechPronunciation, setSpeechPronunciation] = useState("");
  const [selectCustomAddLoading, setSelectCustomAddLoading] = useState(false);

  const addCustomPronunciation = async () => {
    setSelectCustomAddLoading(true);
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      const body = JSON.stringify({
        word: speechWord,
        speech: speechPronunciation,
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
    }
  }

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/tts/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date: startDate || null,
          end_date: endDate || null,
          page_length: pageLength,
          page_number: pageNumber,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecords(data.data || []);
        setTotalPages(data.pagination.total_pages || 1);
      } else {
        console.error("Error:", data.msg);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, [pageNumber]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
  };

  const handleFilter = () => {
    setPageNumber(1);
    fetchRecords();
  };

  const openUpdateModal = (record) => {
    setSelectedRecord(record);
    setUpdateText(record.tts_text);
    setPreviewAudioUrl(null); // Reset preview
    setSelectedListenUrl(null); // Reset selected listen
    setShowUpdateModal(true);
  };

  const openFullTextModal = (record) => {
    setFullTextContent(record.tts_text);
    setFullTextTitle(record.title);
    setShowFullTextModal(true);
  };

  const handleGeneratePreview = async () => {
    if (!updateText || updateText.length < 10) {
      alert("Minimum 10 characters required");
      return;
    }

    setPreviewLoading(true);
    setPreviewAudioUrl(null);

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/tts/create-speech-only`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedRecord.title,
          text: updateText,
          // Using defaults as in backend/Upload.jsx
          voice: "bn-IN-Wavenet-A",
          language: "bn-IN",
          speakingRate: 1.0,
          pitch: 0.0
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Server error");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewAudioUrl(url);

    } catch (err) {
      console.error("Preview error:", err);
      alert("Preview failed: " + err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!updateText || updateText.length < 10) {
      alert("Minimum 10 characters required");
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/tts/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tts_id: selectedRecord.tts_id,
          text: updateText,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Speech updated successfully!");
        setShowUpdateModal(false);
        fetchRecords();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const downloadImage = (url, filename) => {
    const proxyUrl =
      `${process.env.REACT_APP_BACKENDURL}/tts/download-proxy` +
      `?url=${encodeURIComponent(url)}` +
      `&filename=${encodeURIComponent(filename)}`;

    // This triggers the browser's native download behavior
    window.location.href = proxyUrl;
  };

  const handleListenSelectedText = async () => {
    const textarea = updateTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = updateText.substring(start, end);

    if (!selectedText || !selectedText.trim()) {
      alert("Please select some text to listen to.");
      return;
    }

    setSelectedListenLoading(true);
    setSelectedListenUrl(null);

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/tts/create-speech-only`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Selected Preview",
          text: selectedText,
          voice: "bn-IN-Wavenet-A",
          language: "bn-IN",
          speakingRate: 1.0,
          pitch: 0.0
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Server error");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setSelectedListenUrl(url);

    } catch (err) {
      console.error("Preview error:", err);
      alert("Preview failed: " + err.message);
    } finally {
      setSelectedListenLoading(false);
    }
  };

  // const handleListenSelected_DELETED = async () => {
  //   const textarea = listenTextareaRef.current;
  //   if (!textarea) return;

  //   const start = textarea.selectionStart;
  //   const end = textarea.selectionEnd;

  //   if (start === end) {
  //     alert("Please select some text to listen to.");
  //     return;
  //   }

  //   const selectedText = listenText.substring(start, end);
  //   if (!selectedText.trim()) return;

  //   setListenLoading(true);
  //   setListenPreviewUrl(null);

  //   try {
  //     const res = await fetch(`${process.env.REACT_APP_BACKENDURL}/tts/create`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         title: "Preview", // generic title for preview
  //         text: selectedText,
  //         voice: "bn-IN-Wavenet-A",
  //         language: "bn-IN",
  //         speakingRate: 1.0,
  //         pitch: 0.0
  //       }),
  //     });

  //     const data = await res.json();
  //     if (res.ok) {
  //       setListenPreviewUrl(data.audio.url);
  //     } else {
  //       alert("Preview failed: " + (data.error || "Server error"));
  //     }
  //   } catch (err) {
  //     console.error("Preview error:", err);
  //     alert("Preview failed");
  //   } finally {
  //     setListenLoading(false);
  //   }
  // };


  return (
    <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "20px" }}>
      <Link
        to="/tts/upload"
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
        ➕ Add New TTS Record
      </Link>

      <h2 style={{ marginBottom: "15px" }}>TTS Records</h2>

      <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <label>Start Date: </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: "5px" }}
        />
        <label>End Date: </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ padding: "5px" }}
        />
        <button
          onClick={handleFilter}
          style={{ padding: "6px 15px", background: "#4b5563", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Filter
        </button>
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <table
            border="1"
            cellPadding="8"
            cellSpacing="0"
            width="100%"
            style={{ borderCollapse: "collapse" }}
          >
            <thead style={{ background: "#f3f4f6" }}>
              <tr>
                <th>Title</th>
                <th>TTS Text</th>
                <th>Audio URL</th>
                <th>QR CODE</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((rec, index) => {
                  const truncate = (str, len = 40) => {
                    if (!str) return "";
                    return str.length > len ? str.slice(0, len) + "..." : str;
                  };

                  return (
                    <tr key={index}>
                      <td title={rec.title}>{truncate(rec.title, 30)}</td>
                      <td>
                        {truncate(rec.tts_text, 100)}
                        {rec.tts_text?.length > 100 && (
                          <button
                            onClick={() => openFullTextModal(rec)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#2563eb",
                              cursor: "pointer",
                              padding: "0 5px",
                              textDecoration: "underline",
                              fontSize: "14px",
                              fontWeight: "500"
                            }}
                          >
                            View All
                          </button>
                        )}
                      </td>
                      <td>
                        <a
                          href={rec.audio_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Audio
                        </a>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                          <img
                            src={rec.qr_url}
                            alt="QR"
                            style={{ width: "60px", height: "60px", border: "1px solid #ddd", borderRadius: "4px" }}
                          />
                          <button
                            onClick={() => {
                              const sanitizedTitle = (rec.title || "qr")
                                .replace(/\s+/g, '_')
                                .slice(0, 50);
                              console.log(sanitizedTitle);
                              downloadImage(rec.qr_url, `${sanitizedTitle}.jpg`);
                            }}
                            style={{
                              background: "#2563eb",
                              color: "#fff",
                              border: "none",
                              padding: "4px 8px",
                              fontSize: "12px",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                          >
                            Download
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => openUpdateModal(rec)}
                          style={{
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "20px",
            }}
          >
            <button
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber === 1}
              style={{ padding: "5px 12px" }}
            >
              ⬅ Prev
            </button>
            <span style={{ margin: "0 15px" }}>
              Page {pageNumber} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber === totalPages}
              style={{ padding: "5px 12px" }}
            >
              Next ➡
            </button>
          </div>
        </>
      )}

      {/* Full Text Modal */}
      {showFullTextModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1001
        }}>
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "700px",
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", marginBottom: "15px", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0 }}>Full TTS Text</h3>
              <button
                onClick={() => setShowFullTextModal(false)}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#999" }}
              >
                &times;
              </button>
            </div>
            <p style={{ fontWeight: "bold", fontSize: "16px", color: "#333", marginBottom: "10px" }}>{fullTextTitle}</p>
            <div style={{
              backgroundColor: "#f9f9f9",
              padding: "15px",
              borderRadius: "4px",
              border: "1px solid #eee",
              whiteSpace: "pre-wrap",
              fontSize: "15px",
              lineHeight: "1.6",
              color: "#444"
            }}>
              {fullTextContent}
            </div>
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowFullTextModal(false)}
                style={{
                  padding: "8px 20px",
                  background: "#4b5563",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* listen selected record */}
      {/* Listen Modal Removed */}

      {/* Update Modal */}
      {showUpdateModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", marginBottom: "15px", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0 }}>Update TTS Speech</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#666" }}
              >
                &times;
              </button>
            </div>

            <p><strong>Title:</strong> {selectedRecord?.title}</p>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>TTS Text:</label>
              <textarea
                ref={updateTextareaRef}
                value={updateText}
                onChange={(e) => {
                  setUpdateText(e.target.value);
                  setPreviewAudioUrl(null); // Clear preview when text changes
                  // We don't necessarily need to clear selectedListenUrl here, 
                  // but user might want to select new text.
                }}
                style={{
                  width: "100%",
                  height: "400px",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  resize: "vertical"
                }}
              />
            </div>

            {/* Main Preview & Selected Listen Section */}
            <div style={{ marginBottom: "20px", padding: "15px", background: "#f9fafb", borderRadius: "6px", border: "1px solid #e5e7eb" }}>

              {/* Buttons Row */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
                <button
                  onClick={handleGeneratePreview}
                  disabled={previewLoading || !updateText}
                  style={{
                    padding: "8px 16px",
                    background: "#6366f1",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: (previewLoading || !updateText) ? 0.7 : 1
                  }}
                >
                  {previewLoading ? "Generating..." : "🔊 Preview Full Audio"}
                </button>

                <button
                  onClick={handleListenSelectedText}
                  disabled={selectedListenLoading}
                  style={{
                    padding: "8px 16px",
                    background: "#8b5cf6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: selectedListenLoading ? 0.7 : 1
                  }}
                >
                  {selectedListenLoading ? "Generating..." : "🎧 Listen Selected"}
                </button>
                <button
                  onClick={() => setCustomPronunciation(true)}
                  disabled={selectCustomAddLoading}
                  style={{
                    padding: "8px 16px",
                    background: "#f68f5cff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    opacity: selectCustomAddLoading ? 0.7 : 1
                  }}
                >
                  {selectCustomAddLoading ? "Adding..." : "➕ Add Custom Pronunciation"}
                </button>
              </div>

              {/* Audio Players */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

                {/* Full Audio Player */}
                {previewAudioUrl && (
                  <div style={{ background: "#e0e7ff", padding: "10px", borderRadius: "4px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", fontWeight: "bold", color: "#3730a3" }}>Full Preview:</label>
                    <audio controls style={{ width: "100%", height: "35px" }} key={`full-${previewAudioUrl}`}>
                      <source src={previewAudioUrl} type="audio/mpeg" />
                    </audio>
                  </div>
                )}

                {/* Selected Audio Player */}
                {selectedListenUrl && (
                  <div style={{ background: "#ede9fe", padding: "10px", borderRadius: "4px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "12px", fontWeight: "bold", color: "#5b21b6" }}>Selected Text Preview:</label>
                    <audio controls style={{ width: "100%", height: "35px" }} key={`sel-${selectedListenUrl}`} autoPlay>
                      <source src={selectedListenUrl} type="audio/mpeg" />
                    </audio>
                  </div>
                )}

                {/* Selected Audio Player */}
                {customPronunciation && (
                  <div style={styles.audio_container}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input type="text" placeholder="Word" onChange={(e) => setSpeechWord(e.target.value)} style={styles.input} />
                      <input type="text" placeholder="Custom Pronunciation" onChange={(e) => setSpeechPronunciation(e.target.value)} style={styles.input} />
                      <button type="button" style={styles.button} onClick={addCustomPronunciation}>
                        {selectCustomAddLoading ? "Adding..." : "Add Custom Pronunciation"}
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #eee", paddingTop: "15px" }}>
              <button
                onClick={() => setShowUpdateModal(false)}
                style={{
                  padding: "10px 20px",
                  background: "#fff",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updating}
                style={{
                  padding: "10px 20px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  opacity: updating ? 0.7 : 1
                }}
              >
                {updating ? "Updating..." : "Finalize & Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TtsRecordList;
