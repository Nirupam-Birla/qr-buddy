import { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    text: "",
    fgColor: "#000000",
    bgColor: "#ffffff",
    style: "square",
    logo: null,
  });

  const [qrUrl, setQrUrl] = useState(""); // ✅ Added back

  const generateQR = async () => {
    if (formData.text.trim() === "") return;

    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) payload.append(key, value);
    });

    try {
      const response = await fetch(
        "https://qr-buddy-backend.onrender.com/generate_qr",
        {
          method: "POST",
          body: payload,
        }
      );

      if (!response.ok) throw new Error("Failed to generate QR code");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setQrUrl(url);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // Update your JSX structure like this:
  return (
    <div className="App">
      <h1>Creative QR Code Generator 🎨</h1>

      <div className="form-container">
        <div className="form-group">
          <label>Text:</label>
          <input
            type="text"
            name="text"
            placeholder="Enter text or URL"
            value={formData.text}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <div className="color-pickers">
            <div className="color-group">
              <label>Foreground: </label>
              <input
                type="color"
                name="fgColor"
                value={formData.fgColor}
                onChange={handleChange}
              />
            </div>
            <div className="color-group">
              <label>Background: </label>
              <input
                type="color"
                name="bgColor"
                value={formData.bgColor}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Style: </label>
          <select name="style" value={formData.style} onChange={handleChange}>
            <option value="square">Square</option>
            <option value="rounded">Rounded</option>
          </select>
        </div>

        <div className="form-group">
          <label>Logo (optional): </label>
          <input type="file" name="logo" onChange={handleChange} />
        </div>

        <button onClick={generateQR}>Generate QR Code</button>
      </div>

      {qrUrl && (
        <div className="qr-display">
          <h3>Your QR Code:</h3>
          <img src={qrUrl} alt="Generated QR Code" />
          <a href={qrUrl} download="qr_code.png">
            <button className="download-btn">Download PNG</button>
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
