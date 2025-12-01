# Infrastructure Evaluation App

A Next.js application that evaluates a company's infrastructure maturity through a 10-question quiz. Built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and PostgreSQL.

## Features

- 🎯 **10-Question Quiz**: Comprehensive evaluation across 4 categories
- 📊 **Category Scoring**: Infrastructure, Tech Stack, Security, and Scalability
- 💾 **Data Persistence**: Stores results in PostgreSQL database
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 📧 **Email Collection**: Captures business email before showing results
- 📈 **Detailed Results**: Visual breakdown of scores with recommendations

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or hosted)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database:**

   Create the database schema by running the SQL script:
   ```bash
   psql -U your_username -d your_database -f db-schema.sql
   ```

3. **Configure environment variables:**

   Update `.env.local` with your PostgreSQL credentials:
   ```env
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_NAME=your-database-name
   DB_USER=your-username
   DB_PASSWORD=your-password
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
│   ├── db.ts                 # PostgreSQL database connection
│   └── utils.ts              # Utility functions
└── db-schema.sql             # Database schema
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
- **Database**: PostgreSQL
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
1. Check the database schema setup
2. Ensure environment variables are correctly set
3. Check browser console for errors
4. Verify PostgreSQL database connection and table schema
