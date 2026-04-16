async function handleTikTokCallback() {
  try {
    // 1. Get ?code= from URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      alert("No TikTok code found in URL");
      return;
    }

    console.log("TikTok auth code:", code);

    // 2. Call your Edge Function
    const res = await fetch("/functions/v1/tiktok-oauth-callback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    // 3. ALWAYS parse response
    let data;
    try {
      data = await res.json();
    } catch (err) {
      const text = await res.text();
      alert("Non-JSON response:\n" + text);
      throw new Error("Invalid JSON response");
    }

    console.log("FULL RESPONSE:", data);

    // 4. HANDLE ERROR PROPERLY (this is the key fix)
    if (!res.ok) {
      alert("❌ TikTok Error:\n\n" + JSON.stringify(data, null, 2));
      return;
    }

    // 5. SUCCESS
    alert("✅ Connected to TikTok as: " + data.displayName);
  } catch (err) {
    console.error("Unexpected error:", err);
    alert("Unexpected error: " + err.message);
  }
}

// Run it when page loads
handleTikTokCallback();
