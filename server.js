require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// -----------------------------
// 🔐 VirusTotal URL Check API
// -----------------------------
app.post("/check-url", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const apiKey = process.env.VT_API_KEY;

    // Step 1: Encode URL (VirusTotal requirement)
    const encodedUrl = Buffer.from(url).toString("base64").replace(/=/g, "");

    // Step 2: Call VirusTotal
    const vtResponse = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${encodedUrl}`,
      {
        headers: {
          "x-apikey": apiKey
        }
      }
    );

    const stats = vtResponse.data.data.attributes.last_analysis_stats;

    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;

    // Step 3: Determine status
    let status = "Safe 🟢";
    if (malicious > 0) status = "Dangerous 🔴";
    else if (suspicious > 0) status = "Suspicious 🟡";

    // Step 4: Category
    let category = "Safe";
    if (malicious > 0) category = "Malware / Phishing";
    else if (suspicious > 0) category = "Suspicious";

    // Step 5: Brand impersonation (simple heuristic)
    let suggestion = "";
    if (url.includes("g00gle")) {
      status = "Suspicious 🟡";
      category = "Brand Impersonation";
      suggestion = "Did you mean google.com? Do not enter credentials.";
    }

    res.json({
      url,
      status,
      malicious,
      suspicious,
      category,
      suggestion
    });

  } catch (error) {
    console.error("VirusTotal Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to check URL" });
  }
});

// -----------------------------
// 🌐 Start Server (Render-safe)
// -----------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
