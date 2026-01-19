async function checkURL() {
  const urlInput = document.getElementById("urlInput");
  const resultDiv = document.getElementById("result");

  const url = urlInput.value.trim();

  // Validation
  if (!url) {
    resultDiv.style.display = "block";
    resultDiv.className = "dangerous";
    resultDiv.innerText = "❗ Please enter a URL";
    return;
  }

  // Loading state
  resultDiv.style.display = "block";
  resultDiv.className = "loading";
  resultDiv.innerText = "🔍 Analyzing URL security...";

  try {
    const response = await fetch("/check-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();

    // Decide UI color
    if (data.status.includes("Safe")) {
      resultDiv.className = "safe";
    } else if (data.status.includes("Suspicious")) {
      resultDiv.className = "suspicious";
    } else {
      resultDiv.className = "dangerous";
    }

    // Build result UI
    resultDiv.innerHTML = `
      <h3>🔐 Scan Result</h3>
      <p><strong>Status:</strong> ${data.status}</p>
      <p><strong>Category:</strong> ${data.category}</p>
      <p><strong>Malicious Detections:</strong> ${data.malicious}</p>
      <p><strong>Suspicious Detections:</strong> ${data.suspicious}</p>
      ${
        data.suggestion
          ? `<p class="suggestion">⚠ ${data.suggestion}</p>`
          : ""
      }
    `;
  } catch (error) {
    console.error(error);
    resultDiv.className = "dangerous";
    resultDiv.innerText = "⚠ Server connection failed. Try again later.";
  }
}
