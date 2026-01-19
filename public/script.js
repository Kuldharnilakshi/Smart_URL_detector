async function checkURL() {
  const url = document.getElementById("urlInput").value;
  const resultDiv = document.getElementById("result");

  if (!url) {
    resultDiv.style.display = "block";
    resultDiv.className = "dangerous";
    resultDiv.innerText = "❗ Please enter a URL";
    return;
  }

  resultDiv.style.display = "block";
  resultDiv.className = "";
  resultDiv.innerText = "🔍 Analyzing URL...";

  try {
    const response = await fetch("http://127.0.0.1:5000/check-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (data.status.includes("Safe")) {
      resultDiv.className = "safe";
    } else if (data.status.includes("Suspicious")) {
      resultDiv.className = "suspicious";
    } else {
      resultDiv.className = "dangerous";
    }

    resultDiv.innerHTML = `
      <strong>Status:</strong> ${data.status}<br>
      <strong>Malicious:</strong> ${data.malicious}<br>
      <strong>Suspicious:</strong> ${data.suspicious}
    `;
  } catch (error) {
    resultDiv.className = "dangerous";
    resultDiv.innerText = "⚠ Server connection failed";
  }
}
