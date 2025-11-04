# Delaware ASSIST Form Helper

A chat-based application to help users fill out the Delaware ASSIST form with intelligent guidance and real-time progress tracking.

## Features

- **Interactive Chat Agent**: Ask questions and get guidance while filling out the form
- **User Role Selection**: Support for self-application or applying on behalf of a parent
- **Real-time Progress Tracking**: Visual progress bar and section-by-section tracking
- **Eligibility Insights**: Dynamic eligibility assessment based on user responses
- **Structured Form Sections**:
  - Basic Information
  - Household Information
  - Income Information
  - Benefits Needed
  - Additional Information

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Project Structure

```
src/
├── components/          # React components
│   ├── ChatAgent.tsx   # Chat interface
│   ├── ProgressTracker.tsx  # Progress sidebar
│   └── RoleSelection.tsx    # Initial role selection
├── data/               # Form data and configuration
│   └── formSections.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main application
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Customization

### Adding Form Sections

Edit `src/data/formSections.ts` to add or modify form sections and fields.

### Customizing Chat Responses

Update the `generateAssistantResponse` function in `src/App.tsx` to customize the chat agent's behavior.

## Future Enhancements

- Integration with actual AI/LLM for smarter responses
- Form data persistence (localStorage/backend)
- PDF export of completed forms
- Multi-language support
- Accessibility improvements
- Mobile responsive design optimization
