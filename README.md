# AWS Architecture Recommender

An intelligent Next.js application that recommends AWS architecture solutions based on user requirements. Answer a few questions and get a personalized architecture recommendation with diagrams, cost estimates, and detailed PDF reports.

## Features

- 🎯 **Smart Quiz** - Answer questions to get personalized AWS architecture recommendations
- 🏗️ **5 Architecture Templates** - From Basic Web App to Enterprise-grade Infrastructure
- 🖼️ **Dynamic Diagrams** - Architecture diagrams generated on-demand using Python
- 📄 **PDF Export** - Download detailed PDF with architecture diagram, costs, and service details
- 💾 **Database Storage** - Store recommendations and user data in PostgreSQL
- 🎨 **Modern UI** - Beautiful interface built with Next.js, TypeScript, and Tailwind CSS

## Prerequisites

Before you start, make sure you have:

- **Node.js 18+** - JavaScript runtime
- **PostgreSQL** - Database (local or Docker)
- **Python 3.8+** - For diagram generation
- **Graphviz** - System dependency for diagrams

## Installation

### 1. Install Node.js Dependencies

```bash
npm install
```

### 2. Install Python Dependencies (Required for PDF Generation!)

**Install Graphviz:**
```bash
# Ubuntu/Debian
sudo apt install graphviz

# macOS
brew install graphviz
```

**Install Python Packages:**
```bash
pip3 install --break-system-packages diagrams graphviz
```

**Verify Installation:**
```bash
python3 -c "import diagrams; print('✅ Python setup complete!')"
```

### 3. Setup PostgreSQL Database

**Create the database schema:**
```bash
# If using local PostgreSQL
psql -U your_username -d your_database -f db-schema.sql

# If using Docker
docker exec -i your-postgres-container psql -U your_username -d your_database < db-schema.sql
```

### 4. Configure Environment Variables

Create `.env.local` in the project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=infra_architector
DB_USER=your_username
DB_PASSWORD=your_password
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── page.tsx                    # Home page with quiz
│   ├── api/
│   │   ├── generate-pdf/           # PDF generation endpoint
│   │   └── save-evaluation/        # Save recommendation to DB
│   └── layout.tsx                  # Root layout
├── components/
│   ├── quiz.tsx                    # Main quiz component
│   ├── navbar.tsx                  # Navigation bar
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── templates.ts                # AWS architecture templates
│   ├── templateSelector.ts         # Template matching algorithm
│   ├── pdfGenerator.ts             # PDF generation logic
│   ├── diagramGenerator.ts         # Python diagram wrapper
│   └── db.ts                       # PostgreSQL connection
├── templates/                      # Python diagram scripts
│   ├── basic_web_app.py
│   ├── web_app_with_cdn.py
│   ├── highly_available_app.py
│   ├── serverless_hybrid.py
│   └── enterprise_grade.py
├── data/
│   └── questions.ts                # Quiz questions
├── db-schema.sql                   # Database schema
└── requirements.txt                # Python dependencies
```

## How It Works

1. **User completes quiz** - Answer questions about traffic, scalability, budget, etc.
2. **Algorithm matches template** - Smart scoring system finds best architecture fit
3. **Results displayed** - View recommended template, services, and cost estimate
4. **Generate PDF** - Python dynamically generates architecture diagram
5. **Download PDF** - Get comprehensive PDF with diagram and recommendations
6. **Save to database** - Store recommendation for analytics and follow-up

## Architecture Templates

| Template | Best For | Estimated Cost |
|----------|----------|----------------|
| **Basic Web App** | Small apps, MVPs, low traffic | $200 - $500/month |
| **Web App with CDN** | Content-heavy sites, global users | $500 - $1,200/month |
| **Highly Available** | Production apps, high uptime needs | $800 - $2,000/month |
| **Serverless Hybrid** | Event-driven, variable traffic | $500 - $1,500/month |
| **Enterprise Grade** | Large scale, compliance, security | $2,000+/month |

## Technologies

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL
- **PDF Generation**: jsPDF
- **Diagrams**: Python diagrams library + Graphviz
- **Deployment**: Vercel-ready

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. **Important:** Configure build settings:
   - Install Graphviz in build: `apt-get install -y graphviz`
   - Install Python packages: `pip3 install diagrams graphviz`
5. Deploy

### Deploy to Other Platforms

Ensure your deployment environment has:
- Node.js 18+
- Python 3.8+
- Graphviz installed
- Environment variables configured

## Troubleshooting

### PDF Shows "Error: Could not load architecture diagram"

**Cause:** Python packages not installed

**Fix:**
```bash
# Install Graphviz
sudo apt install graphviz  # or brew install graphviz

# Install Python packages
pip3 install --break-system-packages diagrams graphviz

# Verify
python3 -c "import diagrams; print('✅ Ready!')"
```

### Database Connection Error

**Fix:**
1. Ensure PostgreSQL is running
2. Check `.env.local` credentials are correct
3. Verify database exists: `psql -U user -d db -c "SELECT 1"`
4. Run schema: `psql -U user -d db -f db-schema.sql`

### Module Not Found Errors

**Fix:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Diagram Generation Timeout

**Cause:** Python script taking too long

**Fix:**
1. Check Python script works: `cd templates && python3 basic_web_app.py`
2. Verify Graphviz: `dot -V`
3. Check server logs for specific error

## Database Schema

The application stores architecture recommendations:

```sql
architecture_recommendations (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  aws_resources TEXT[] NOT NULL,
  selected_template VARCHAR(100) NOT NULL,
  estimated_monthly_cost VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Development

### Adding New Architecture Templates

1. Create Python diagram in `templates/[name].py`
2. Add template definition in `lib/templates.ts`
3. Update mapping in `lib/diagramGenerator.ts`
4. Test diagram generation and PDF export

### Modifying Quiz Questions

Edit `data/questions.ts`:
- Add/remove questions
- Update AWS resources tags
- Modify option text
