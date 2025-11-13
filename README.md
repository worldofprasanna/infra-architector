# Infrastructure Evaluation App

A Next.js application that evaluates a company's infrastructure maturity through a 10-question quiz. Built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Features

- 🎯 **10-Question Quiz**: Comprehensive evaluation across 4 categories
- 📊 **Category Scoring**: Infrastructure, Tech Stack, Security, and Scalability
- 💾 **Data Persistence**: Stores results in Supabase
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 📧 **Email Collection**: Captures business email before showing results
- 📈 **Detailed Results**: Visual breakdown of scores with recommendations

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**

   Follow the instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
   - Create a Supabase project
   - Set up the database table
   - Get your API credentials

3. **Configure environment variables:**

   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── page.tsx              # Home page (Quiz)
│   ├── email/
│   │   └── page.tsx          # Email collection page
│   ├── results/
│   │   └── page.tsx          # Results display page
│   └── globals.css           # Global styles
├── components/
│   ├── quiz.tsx              # Main quiz component
│   └── ui/                   # shadcn/ui components
├── data/
│   └── questions.ts          # Quiz questions and categories
├── lib/
│   ├── supabase.ts           # Supabase client setup
│   └── utils.ts              # Utility functions
└── SUPABASE_SETUP.md         # Supabase setup instructions
```

## Quiz Categories

The quiz evaluates across 4 key categories:

1. **Infrastructure** (3 questions)
   - Hosting solutions
   - Deployment processes
   - Monitoring and logging

2. **Tech Stack** (2 questions)
   - Database solutions
   - Frontend frameworks

3. **Security** (3 questions)
   - Authentication methods
   - Disaster recovery
   - API protection

4. **Scalability** (2 questions)
   - Load handling
   - API architecture

## Scoring System

- Each question has 4 options worth 5, 15, 20, or 25 points
- Maximum score per category: 75 points
- Maximum total score: 300 points
- Grades: A+ (90%+), A (80%+), B (70%+), C (60%+), D (50%+), F (<50%)

## Customization

### Modifying Questions

Edit `data/questions.ts` to:
- Add/remove questions
- Change scoring values
- Update categories
- Modify question text

### Styling

The app uses Tailwind CSS and shadcn/ui. Customize:
- Global styles in `app/globals.css`
- Component styles using Tailwind classes
- shadcn theme in `components.json`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Deploy to Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## Technologies Used

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## Database Schema

The app stores evaluations in a `evaluations` table with:
- `id`: Primary key
- `email`: Business email
- `infrastructure_score`: Infrastructure category score
- `tech_stack_score`: Tech stack category score
- `security_score`: Security category score
- `scalability_score`: Scalability category score
- `total_score`: Total score across all categories
- `created_at`: Timestamp

## Contributing

Feel free to:
- Add more questions
- Improve UI/UX
- Add data visualization
- Export results as PDF
- Add comparison with industry benchmarks

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues or questions:
1. Check the Supabase setup instructions
2. Ensure environment variables are correctly set
3. Check browser console for errors
4. Verify Supabase table exists and has correct schema
