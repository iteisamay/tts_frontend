import React, { useEffect, useState } from "react";

function ElevenLabsData() {
  const [credits, setCredits] = useState(null);
  const [error, setError] = useState(null);



  const fetchElevenLabData = async () => {
    try {
      const url = `${process.env.REACT_APP_BACKENDURL}/tts/llm/get/credit/eleven`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = await res.json();
      setCredits(data.data);
      console.log("ElevenLabs credits:", data);

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

    useEffect(() => {
    fetchElevenLabData();
  }, []);

  return (
    <div>
      <h3>ElevenLabs Credits</h3>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!credits && !error && <p>Loading...</p>}

      {credits && (
        <div>
          <p>Total: {credits.total}</p>
          <p>Used: {credits.used}</p>
          <p>Remaining: {credits.remaining}</p>
        </div>
      )}
    </div>
  );
}

export default ElevenLabsData;
