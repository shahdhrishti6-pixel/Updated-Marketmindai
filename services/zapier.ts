
/**
 * Zapier Integration Service
 * Sends data to a Zapier Webhook URL provided by the user.
 */

export interface ZapierPayload {
  email?: string;
  name?: string;
  conversation?: string;
  report?: string;
  imageUrl?: string;
  query?: string;
  sources?: any[];
  aspectRatio?: string;
  prompt?: string;
  timestamp: string;
  source: string;
}

export const sendToZapier = async (webhookUrl: string, payload: ZapierPayload): Promise<boolean> => {
  if (!webhookUrl) return false;

  try {
    const response = await window.fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors', // Standard for Zapier webhooks in browser contexts
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log("Zapier: Data dispatched to webhook.");
    return true;
  } catch (error) {
    console.error("Zapier Error:", error);
    return false;
  }
};
