import { useEffect } from "react";

export default function Callback() {
  useEffect(() => {
    const hash = window.location.hash;

    console.log("🔁 URL HASH:", hash); // DEBUG

    if (hash) {
      const params = new URLSearchParams(hash.substring(1));

      const accessToken = params.get("access_token");
      const instanceUrl = params.get("instance_url");

      console.log("✅ TOKEN:", accessToken);
      console.log("✅ INSTANCE:", instanceUrl);

      if (accessToken && instanceUrl) {
        localStorage.setItem("sf_token", accessToken);
        localStorage.setItem("sf_instance", instanceUrl);

        alert("✅ Login Successful");

        // redirect to home
        window.location.href = "/";
      } else {
        alert("❌ Token not received");
      }
    }
  }, []);

  return <h2 style={{ textAlign: "center" }}>Processing Login...</h2>;
}