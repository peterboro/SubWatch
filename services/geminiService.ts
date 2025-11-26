import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL_FAST } from "../constants";
import { BillingCycle, Category, Subscription } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using a slightly more relaxed response schema to ensure Gemini doesn't fail on ambiguity
const subscriptionSchema = {
  type: Type.OBJECT,
  properties: {
    isSubscription: { type: Type.BOOLEAN, description: "True if the email text confirms a subscription payment or renewal." },
    serviceName: { type: Type.STRING, description: "Name of the service (e.g. Netflix)." },
    amount: { type: Type.NUMBER, description: "The amount charged." },
    currency: { type: Type.STRING, description: "Currency code (USD, EUR, etc)." },
    billingCycle: { type: Type.STRING, description: "Monthly, Yearly, Weekly, or Unknown" },
    nextRenewalDate: { type: Type.STRING, description: "Estimated next renewal date in ISO format YYYY-MM-DD. Calculate based on cycle." },
    category: { type: Type.STRING, description: "One of: Entertainment, Utilities, SaaS, Business, Shopping, Health, Other" },
    description: { type: Type.STRING, description: "Brief description of the plan." },
  },
  required: ["isSubscription", "serviceName", "amount", "currency", "billingCycle", "category"]
};

export const parseEmailToSubscription = async (emailBody: string, emailDate: string): Promise<Partial<Subscription> | null> => {
  try {
    const prompt = `
      Analyze the following email content. It was received on ${emailDate}.
      Determine if it is a subscription receipt, invoice, or renewal notice.
      If it is, extract the details.
      
      Email Content:
      ${emailBody.substring(0, 5000)} 
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: subscriptionSchema,
        temperature: 0.1, // Low temperature for factual extraction
      },
    });

    const result = JSON.parse(response.text || "{}");

    if (result.isSubscription) {
      // Clean up the result to match our TS types exactly
      let cycle = BillingCycle.Unknown;
      if (result.billingCycle?.toLowerCase().includes('month')) cycle = BillingCycle.Monthly;
      if (result.billingCycle?.toLowerCase().includes('year') || result.billingCycle?.toLowerCase().includes('annual')) cycle = BillingCycle.Yearly;

      let category = Category.Other;
      const cat = result.category as string;
      if (Object.values(Category).includes(cat as Category)) {
        category = cat as Category;
      }

      return {
        serviceName: result.serviceName,
        amount: result.amount,
        currency: result.currency,
        billingCycle: cycle,
        nextRenewalDate: result.nextRenewalDate,
        category: category,
        description: result.description,
        confidenceScore: 0.95
      };
    }

    return null;
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
};

export const generateUnsubscribeEmail = async (subscription: Subscription, userName: string): Promise<string> => {
    try {
        const prompt = `
            Write a polite but firm cancellation email for a subscription service.
            
            Service: ${subscription.serviceName}
            My Name: ${userName}
            Account Email: [Insert Email Here]
            
            The email should request immediate cancellation and confirmation of the cancellation.
            Keep it professional.
        `;

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_FAST,
            contents: prompt,
        });

        return response.text || "Could not generate email.";
    } catch (error) {
        return "Dear Support,\n\nI would like to cancel my subscription. Please confirm when this is processed.\n\nThank you.";
    }
}

export const generateSavingsTips = async (subscriptions: Subscription[]): Promise<string[]> => {
    try {
        const subsList = subscriptions.map(s => `${s.serviceName}: ${s.currency} ${s.amount} (${s.billingCycle})`).join('\n');
        const prompt = `
            Analyze these subscriptions and provide 3 short, punchy tips to save money.
            Focus on identifying potential redundancies or expensive recurring costs.
            Return a JSON array of strings.
            
            Subscriptions:
            ${subsList}
        `;

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        return JSON.parse(response.text || "[]");
    } catch (e) {
        return ["Review your unused subscriptions.", "Consider switching to yearly billing for discounts.", "Check for student or family plans."];
    }
}
