/**
 * MarketMind AI Automation Service
 * This service handles free data logging via Google Apps Script.
 */

// Updated Production Google Web App URL using the latest Deployment ID
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzoKW1DasBAndiBUsxBfXaoSnW50HrpO7ahoPj3FwK6_Px6CkNVe29uXsu7IyqK4Li3WA/exec";

export const logUserSignIn = async (email: string) => {
  // Construct parameters with a timestamp and cache buster
  const params = new URLSearchParams({
    email: email,
    source: "MarketMind AI Portal",
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    _cb: Date.now().toString() 
  });

  const finalUrl = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;

  // Log progress for debugging in browser console
  console.log("Automation: Sending data to Google Sheets...", finalUrl);

  try {
    /**
     * Using GET with 'no-cors' is the most compatible way to trigger Google Apps Script.
     * Since the script's job is just to record data, we don't need to read the response.
     * 'keepalive: true' ensures the request finishes even if the user navigates away.
     */
    window.fetch(finalUrl, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache',
      keepalive: true,
    });
    
    console.log("Automation: Request dispatched successfully to the new deployment.");
  } catch (error) {
    console.error("Automation Error:", error);
  }
};