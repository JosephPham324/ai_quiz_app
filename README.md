# AI Quiz Generator 🧠✨

A modern, AI-powered quiz application that transforms your study materials into interactive learning experiences. Upload knowledge files, generate intelligent questions, and strengthen your understanding with AI-evaluated practical examples.

## 🚀 Key Features

- **Multi-Format Knowledge Upload**: Support for `.md`, `.txt`, and `.docx` files.
- **Intelligent Question Generation**: Automatically generates high-quality multiple-choice and written questions using OpenAI's latest models.
- **Advanced Grading Modes**: 
  - **Strict Match**: For precise terminology and definitions.
  - **AI Evaluator**: Uses GPT to understand context and nuance in written responses.
- **Practical Application Learning**:
  - **Practical Example Mode**: Input your own real-world scenarios to see how theory applies in practice.
  - **AI-Generated Case Studies**: Click "Provide Example" to get a beautifully rendered markdown example (including code blocks) tailored to the question.
- **Question Bank Management**:
  - Export your generated questions to CSV.
  - Import existing question banks.
  - Shuffle and clear functionality for endless practice.
- **Premium UI/UX**: Built with a sleek, responsive design featuring glassmorphism, smooth transitions, and rich typography.

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (with [Typography plugin](https://github.com/tailwindlabs/tailwindcss-typography))
- **AI Integration**: [OpenAI API](https://openai.com/) (gpt-4.1-nano)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Parsing Libraries**:
  - [PapaParse](https://www.papaparse.com/) (CSV)
  - [Mammoth](https://github.com/mwilliamson/mammoth.js) (DOCX)
- **Markdown Support**: [react-markdown](https://github.com/remarkjs/react-markdown) & [remark-gfm](https://github.com/remarkjs/remark-gfm)

## 📺 Demo

*[Placeholder for Demo Video - You can insert your recorded demo video here or embed a YouTube link]*

> [!TIP]
> You can try importing the `sample_questions.csv` included in the repository for a quick demo of the quiz interface!

## ⚙️ Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the app and configure your **OpenAI API Key** in the settings (stored locally).

---
Developed with ❤️ by Joseph Pham
