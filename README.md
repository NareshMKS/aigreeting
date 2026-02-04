# Automatic Greeting Card Generator

A React-based web app that lets you upload a CSV, choose a template, generate personalized greeting cards with configurable AI text, and export them as PNG or PDF.

## Tech Stack

- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React Hooks & Context API
- **CSV:** Client-side parsing
- **Export:** html2canvas + jsPDF (PNG / PDF)

## Quick Start

```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). Drag-and-drop `public/sample-recipients.csv` (or [download it](public/sample-recipients.csv)) to try the flow.

## User Flow

1. **Upload CSV** — Drag & drop a `.csv` file (columns: `name`, `occasion`, `tone`, `custom_message`).
2. **Select template** — Pick a card layout, font, and color palette.
3. **Generate** — AI greeting text is generated per recipient (placeholder service; wire your own API).
4. **Preview & download** — View all cards and export as PNG (per card or all) or one PDF.

## Project Structure

```
src/
  components/   CSVUploader, TemplateSelector, CardCanvas, CardPreview, OutputGallery
  services/     csvParser.ts, aiGreetingService.ts
  context/      AppContext.tsx
  types/        template.ts, recipient.ts
  data/         sampleTemplates.ts
  styles/       index.css
  App.tsx, main.tsx
```

## AI Integration

Edit `/src/services/aiGreetingService.ts`:

- Set `AI_PROVIDER_NAME` to your provider (e.g. `'OpenAI'`, `'Anthropic'`).
- Replace the `generateGreeting` implementation with your API client (fetch/axios to your chosen endpoint).

## Sample CSV

`public/sample-recipients.csv`:

```csv
name,occasion,tone,custom_message
Alice,Birthday,Warm,Have an amazing day!
Bob,Holiday,Formal,Wishing you joy this season.
```

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build
