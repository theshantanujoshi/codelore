async function test() {
  try {
    console.log("Fetching...");
    const res = await fetch("http://localhost:3001/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://github.com/sparshsharma-dev/manshverse-web" })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response text:", text);
    try {
      console.log("JSON:", JSON.parse(text));
    } catch(e) {
      console.log("Not JSON");
    }
  } catch(e) {
    console.error("Fetch error:", e);
  }
}
test();
