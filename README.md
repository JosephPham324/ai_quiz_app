# AI Quiz Generator 🧠✨

A modern, AI-powered quiz application that transforms your study materials into interactive learning experiences. Upload knowledge files, generate intelligent questions, and strengthen your understanding with AI-evaluated practical examples.

## 🚀 Key Features

- **Multi-Format Knowledge Upload**: Support for `.md`, `.txt`, and `.docx` files.
- **Intelligent Question Generation**: Automatically generate high-quality multiple-choice, written, and coding questions. Configure question complexity (brief, elaborate, practical, coding) and select your preferred AI model.
- **Advanced Grading Modes**: 
  - **Strict Match**: For precise terminology and definitions.
  - **AI Evaluator**: Uses GPT to understand context and nuance in written responses.
  - **Code Evaluator**: Built-in code editor that evaluates both programming logic and written rationale.
- **Practical Application Learning**:
  - **Practical Example Mode**: Input your own real-world scenarios to see how theory applies in practice.
  - **AI-Generated Case Studies**: Experience beautifully rendered markdown examples (including language-specific code blocks) tailored to the question.
- **Customizable Quiz Sessions & Source Tracking**:
  - Configure quiz length, per-file question limits, and scrambling.
  - Track question origins with colored source badges and legends.
- **Question Bank Management**:
  - Export your generated questions to CSV.
  - Import existing question banks.
- **Premium UI/UX**: Built with a sleek, responsive design featuring glassmorphism, smooth transitions, and rich typography.

## 🛠️ Tech Stack

- **Core**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (with [Typography plugin](https://github.com/tailwindlabs/tailwindcss-typography))
- **AI Integration**: [OpenAI API](https://openai.com/) (Support for various models via selector)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Parsing Libraries**:
  - [PapaParse](https://www.papaparse.com/) (CSV)
  - [Mammoth](https://github.com/mwilliamson/mammoth.js) (DOCX)
- **Markdown Support**: [react-markdown](https://github.com/remarkjs/react-markdown) & [remark-gfm](https://github.com/remarkjs/remark-gfm)

## 📺 Demo

*[Placeholder for Demo Video]*

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
