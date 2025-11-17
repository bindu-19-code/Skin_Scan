let API = process.env.REACT_APP_API_URL;

// If no env var OR running on local network (mobile testing)
if (!API) {
  const hostname = window.location.hostname;

  // If you're on laptop browser
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    API = "http://localhost:5000";
  } 
  // If you're on your phone on same WiFi
  else {
    // Your laptop's IPv4
    API = "http://10.171.26.117:5000";
  }
}

export default API;
