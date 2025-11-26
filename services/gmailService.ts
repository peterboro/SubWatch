import { GOOGLE_CLIENT_ID, SCOPES } from "../constants";
import { EmailMessage } from "../types";

let tokenClient: any;
let accessToken: string | null = null;

// Initialize Google Identity Services
export const initGoogleAuth = (callback: (response: any) => void) => {
  if (typeof window !== 'undefined' && (window as any).google) {
    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse: any) => {
        accessToken = tokenResponse.access_token;
        callback(tokenResponse);
      },
    });
  }
};

export const signInWithGoogle = () => {
  if (tokenClient) {
    tokenClient.requestAccessToken();
  } else {
    console.error("Token client not initialized");
  }
};

export const fetchGmailMessages = async (): Promise<EmailMessage[]> => {
  if (!accessToken) throw new Error("Not authenticated");

  // 1. List messages
  // Searching for keywords: subscription, payment, invoice, receipt, renew
  const query = 'subject:(subscription OR receipt OR invoice OR renew OR payment) newer_than:1y';
  
  try {
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const listData = await listResponse.json();
    if (!listData.messages) return [];

    // 2. Get details for each message
    const emailPromises = listData.messages.map(async (msg: { id: string }) => {
      const msgResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const msgData = await msgResponse.json();
      
      // Extract headers
      const headers = msgData.payload.headers;
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
      const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
      const date = headers.find((h: any) => h.name === 'Date')?.value || new Date().toISOString();

      // Extract body (snippet is easier, but full body is better for AI)
      let body = msgData.snippet; // Fallback
      if (msgData.payload.parts) {
         // simplistic text extraction
         const textPart = msgData.payload.parts.find((p: any) => p.mimeType === 'text/plain');
         if (textPart && textPart.body.data) {
             body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
         }
      } else if (msgData.payload.body.data) {
         body = atob(msgData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }

      return {
        id: msg.id,
        snippet: msgData.snippet,
        body: body,
        date,
        from,
        subject
      } as EmailMessage;
    });

    return await Promise.all(emailPromises);

  } catch (error) {
    console.error("Error fetching emails", error);
    throw error;
  }
};

export const getUserProfile = async () => {
  if (!accessToken) throw new Error("Not authenticated");
  const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: {
          Authorization: `Bearer ${accessToken}`,
      },
  });
  return await response.json();
}
