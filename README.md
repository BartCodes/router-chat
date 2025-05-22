# RouterChat

![RouterChat Screenshot](screenshot.png)

**Live Demo:** [https://router-chat-sigma.vercel.app/](https://router-chat-sigma.vercel.app/)

RouterChat is a web-based AI chatbot interface built as a portfolio project. It utilizes Next.js for the frontend and backend and connects to OpenRouter to allow users to interact with various free AI language models. The application features a clean, responsive dark-mode design with smooth animations, focusing on showcasing modern frontend and backend development skills.

## Features

- Select AI model from a dropdown.
- Send messages to the selected AI model.
- View AI responses streamed in real-time.
- Display conversation history with distinct user/AI messages.
- Start new conversations.
- Conversations are automatically saved to browser local storage.
- View a list of saved conversations in a sidebar.
- Automatically name new conversations.
- Edit conversation names via a context menu.
- Delete conversations via a context menu.
- Switch between saved conversations.
- Last selected AI model is remembered for new conversations.
- Initial view shows an empty chat window.
- Toast notifications for API errors.
- Loading indicator while AI is responding.
- Input field disabled while AI is responding.

## Technologies Used

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui & Aceternity UI
- Lucide React (Icons)
- Framer Motion (Animations)
- Browser Local Storage
- OpenRouter API (for chat completions)

## Project Structure

The project follows a standard Next.js App Router structure:

```
.
├── app/                      # Next.js App Router: Routes, layouts, API routes
│   ├── api/                  # API routes
│   │   └── chat/
│   │       └── route.ts      # Handles chat completions
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main page component
│   └── globals.css           # Global styles (includes Tailwind config)
├── components/               # Reusable UI components
│   ├── ui/                   # shadcn/ui components
│   └── chat/                 # Chat-specific components
├── lib/                      # Utility functions, types, constants
├── public/                   # Static assets
└── ... (config files, etc.)
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Key Management

This project requires an OpenRouter API key to interact with AI models. You need to set this key as an environment variable.

1.  Obtain an API key from OpenRouter.
2.  Create a `.env.local` file in the root of your project (if it doesn't exist).
3.  Add the following line to your `.env.local` file:
    ```
    OPENROUTER_API_KEY=your_openrouter_api_key_here
    ```
    Replace `your_openrouter_api_key_here` with your actual API key.
4.  When deploying to Vercel, add `OPENROUTER_API_KEY` as an environment variable in your Vercel project settings.

**Note:** The `.env.local` file is ignored by Git (`.gitignore`) and should not be committed to your repository.
