# 🧠 SubWatch — Automatic Subscription Management Web App

**SubWatch** is a smart subscription manager that **automatically detects and tracks your recurring subscriptions** by scanning emails from Gmail. Stop manually entering subscriptions in a spreadsheet — SubWatch pulls them from your inbox, organizes them, predicts renewals, and helps you manage or cancel them with ease.


## 📌 Table of Contents

* 🔍 Features
* 🧩 Tech Stack
* 🛠️ Architecture Overview
* 📂 Folder Structure
* 🛠 Installation & Setup
* 🔐 Gmail API Integration
* 🎯 Usage
* 🧪 Testing
* 🚀 Deployment
* 🔧 Roadmap & Future Enhancements
* 🤝 Contributing
* 📝 License
* 📬 Contact

---

## 🔍 Features

✨ **Automatic Subscription Detection**

* Connect your Gmail account securely
* Scan email inbox to extract subscription info:

  * Service name
  * Billing amount
  * Billing cycle
  * Next renewal date
  * Cancellation links

🧾 **Subscription Dashboard**

* View dashboard with all your subscriptions
* “Renews in X days” reminders
* Monthly & yearly spend summaries

📉 **Analytics & Insights**

* Total spend
* Spending by category
* Upcoming renewals

📬 **Unsubscribe Support**

* One-click unsubscribe links
* AI-generated unsubscribe email drafts

🔁 **Background Sync**

* Re-scan Gmail periodically for new subscriptions
* Detect price changes or expired trials

⚡ **Notifications**

* Email alerts for upcoming renewals (configurable)

---

## 🧩 Tech Stack

| Layer          | Technology                         |
| -------------- | ---------------------------------- |
| Frontend       | Next.js & React                    |
| Styling        | TailwindCSS                        |
| Backend        | Node.js API (Next.js API Routes)   |
| Authentication | Google OAuth 2.0                   |
| Email API      | Gmail API (OAuth + Gmail.readonly) |
| AI Parsing     | Gemini API or OpenAI API           |
| Database       | Supabase / PostgreSQL / Firebase   |
| Deployment     | Vercel / Render / Railway          |

---

## 🛠 Architecture Overview

```
                ┌──────────────┐
   Gmail OAuth   │  Gmail API   │
      ─────────> │  (read only) │
                └───────▲──────┘
                        │
                        │ Email fetch
                        │
             ┌──────────┴──────────┐
             │  Parsing Logic     │
             │   (AI / Regex)     │
             └──────────┬──────────┘
                        │ Extracted Subscriptions
                        ▼
            ┌─────────────────────────┐
            │     Backend API         │
            │  (Next.js API Routes)   │
            └───────▲─────────▲───────┘
                    │         │
            Database │         │ Frontend UI
                    │         ▼
            ┌─────────────────────────┐
            │   SubWatch Frontend     │
            │ (Next.js + TailwindCSS)│
            └─────────────────────────┘
```

---

## 📂 Folder Structure

```
SubWatch/
├── .github/
├── public/
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...google].js
│   │   │   ├── gmail/
│   │   │   │   └── fetchEmails.js
│   │   │   └── subscriptions.js
│   │   ├── dashboard.js
│   │   ├── analytics.js
│   │   └── index.js
│   ├── components/
│   ├── styles/
│   └── utils/
├── .env.local
├── README.md
├── package.json
└── tailwind.config.js
```

---

## 🛠 Installation & Setup

### 🔹 1. Clone the Repo

```bash
git clone https://github.com/peterboro/SubWatch.git
cd SubWatch
```

### 🔹 2. Install Dependencies

```bash
npm install
```

> You can also use `yarn` if preferred:

```bash
yarn install
```

---

## 🔐 Gmail API Integration (Important)

To scan user inbox for subscriptions, SubWatch must connect to Gmail API.

### ⚙️ 1. Configure Google Cloud

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Gmail API**
4. Setup **OAuth Consent Screen**
5. Add Authorized Redirect URIs:

   ```
   https://your-app-url.com/api/auth/google/callback
   ```
6. Create OAuth credentials:

   * Client ID
   * Client Secret

### ⚙️ 2. Environment Variables

Create a `.env.local` file:

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-app-url.com
DATABASE_URL=postgresql://username:password@host:port/dbname
AI_API_KEY=your-ai-model-api-key
```

---

## 🎯 Usage

### 🔹 Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser

---

## 🧪 Testing

🚀 Add unit or integration tests later with:

* Jest
* React Testing Library
* Supabase Testing Utilities

---

## 🚀 Deployment

Deploy your app to:

* **Vercel**
* **Render**
* **Railway**

Make sure your environment variables are configured in your hosting dashboard.

---

## 🔧 Roadmap & Future Enhancements

✔ Automatic Gmail subscription discovery
✔ AI-powered email parsing
↓ Coming soon:

* Outlook / Yahoo mail support
* OCR receipt scanning
* Export to PDF/CSV
* Push notifications
* Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome!
Please follow these steps:

1. Fork the repo
2. Create a feature branch
3. Open a Pull Request
4. Add test coverage if applicable

---

## 📝 License

Distributed under the **MIT License**.

---

## 📬 Contact

**Peter Boro**
📧 [ptahbn@gmail.com](mailto:ptahbn@gmail.com)
🌐 [https://github.com/peterboro](https://github.com/peterboro)

