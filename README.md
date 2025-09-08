# JIA-Integrated-Management-System

A **cross-platform desktop application** built with **Electron.js**, **React**, and **TypeScript**.  
Developed for **JIA Business Center** as the final project for the **Software Engineering** course.

---

## 🚀 Features (Planned / In Progress)

* 📦 **Inventory Tracking** – Manage stock levels and product details.
* 👨‍💼 **Employee Information** – Store attendance and basic employee records.
* 💳 **E-Wallet / Financials** – Track wallet balances and transactions.
* 📊 **Analytics Dashboard** – Display business insights with charts and reports.

---

## 🛠️ Tech Stack

* **Electron.js** – Cross-platform desktop app framework.
* **React + Vite** – Frontend UI.
* **TypeScript** – Type-safe development for both React & Electron.
* **Node.js** – Backend logic inside Electron.
* **SQLite** – Lightweight, file-based relational database.
* **Tailwind CSS** – Utility-first CSS framework for styling.

---

## 📦 Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/6reenhorn/JIA-Integrated-Management-System.git
   cd JIA-Integrated-Management-System
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Build the project:**

   * Build React frontend (TypeScript + Vite):

     ```bash
     npm run build
     ```
   * Transpile Electron (TypeScript → JavaScript):

     ```bash
     npm run transpile:electron
     ```

4. **Start the app (choose one):**

   * Run React dev server:

     ```bash
     npm run dev:react
     ```
   * Run Electron in dev mode:

     ```bash
     npm run dev:electron
     ```

5. **Single-line Command (Build + Start):**

    * Build and Run servers:
      ```bash
      npm run dev
      ```

---

## 👥 Team

| Full Name                   | GitHub Username | Project Manager | Full-Stack Dev | Front-End Dev | UI/UX Designer | QA | Documentation | Lead Role                       |
| --------------------------- | --------------- | --------------- | -------------- | ------------- | -------------- | -- | ------------- | ------------------------------- |
| **Anino, Glenn Mark R.**    | `@GShadow2005`             | —               | ✔️             | —             | —              | ✔️ | —             | Lead QA                         |
| **Antonio, Den Jester B.**  | `@dnjstr`             | —               | ✔️             | —             | —              | ✔️ | —             | —                               |
| **Casia, John Jaybird L.**  | `@KokoMinaj`             | —               | —              | —             | ✔️             | ✔️ | —             | —                               |
| **Espina, John Cyril G.**   | `@6reenhorn`    | ✔️              | ✔️             | —             | —              | —  | ✔️            | Lead Full-Stack / Documentation |
| **Flores, Sophia Marie M.** | `@piaamarie`             | —               | —              | ✔️            | ✔️             | —  | ✔️            | Lead UI/UX                      |
| **Marabe, Julien A.**       | `@`             | —               | —              | —             | ✔️             | ✔️ | —             | —                               |

---

## 📌 Notes

* Currently in **early development** – more features and improvements will be added.
* Uses **SQLite** for local data storage (no external DB setup required).
* Written in **TypeScript** for better maintainability and fewer runtime errors.

---