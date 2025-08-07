# AbNovoBench

A comprehensive, standardized, and reliable benchmarking system for antibody de novo peptide sequencing of proteomics tandem mass spectrometry.

## 🚀 Features

- **Model Evaluation**: Comprehensive evaluation of de novo peptide sequencing models
- **Accuracy Metrics**: AA precision, recall, peptide precision, recall, PTM precision, recall, and AUC
- **Error Analysis**: Detailed error type analysis for model improvement
- **Coverage Depth**: Position-specific coverage analysis
- **Robustness Testing**: Noise factor and missing cleavage impact analysis
- **Assembly Evaluation**: Full-length sequence reconstruction assessment
- **User Management**: Secure user registration and authentication
- **Model Submission**: Platform for researchers to submit their models

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and Shadcn/ui
- **Backend**: Node.js with Express.js and PostgreSQL
- **Database**: PostgreSQL for data persistence
- **Deployment**: Docker with Nginx reverse proxy
- **Authentication**: JWT-based authentication system

## 📊 Evaluation Metrics

### Accuracy Metrics
- **AA Precision**: Amino acid level precision
- **AA Recall**: Amino acid level recall
- **Peptide Precision**: Peptide level precision
- **Peptide Recall**: Peptide level recall
- **PTM Precision**: Post-translational modification precision
- **PTM Recall**: Post-translational modification recall
- **AUC**: Area under the curve

### Error Analysis
- **Inversion Errors**: First/last 3 AAs inversion
- **Replacement Errors**: Single/double AA replacement
- **Multiple Errors**: More than 6 AAs wrong
- **Other Errors**: Miscellaneous error types

### Robustness Testing
- **Noise Factor Impact**: Performance under different noise levels
- **Missing Cleavages**: Impact of missing cleavage sites
- **Peptide Length**: Performance across different peptide lengths

## 🛠️ Installation

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- PostgreSQL 12+ (for development)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/abnovobench.git
   cd abnovobench
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=abnovo
DB_USER=your-database-user
DB_PASSWORD=your-database-password

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Server Configuration
NODE_ENV=production
PORT=5000

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
abnovobench/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── services/        # API services
│   │   └── context/         # React context providers
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   └── config/          # Configuration files
│   └── package.json
├── nginx/                   # Nginx configuration
├── data/                    # Data files (not in repo)
│   ├── assembly/           # Assembly evaluation data
│   ├── impact/             # Robustness testing data
│   ├── csv/                # CSV data files
│   ├── mgf/                # MGF spectrum files
│   └── depth/              # Coverage depth data
├── docker-compose.yml       # Docker orchestration
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🔧 Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Database Setup

1. **Create database**
   ```sql
   CREATE DATABASE abnovo;
   ```

2. **Run migrations**
   ```bash
   # The database schema is automatically created on first run
   ```

## 📈 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/me` - Get current user info

### Model Endpoints

- `GET /api/models` - Get all models
- `GET /api/models/:id` - Get model by ID
- `POST /api/models` - Create new model
- `PUT /api/models/:id` - Update model
- `DELETE /api/models/:id` - Delete model

### Evaluation Endpoints

- `GET /api/evaluation/models` - Get evaluation data
- `GET /api/metrics/all` - Get all metrics
- `GET /api/metrics/error-types` - Get error type analysis
- `GET /api/depth` - Get coverage depth data
- `GET /api/robustness` - Get robustness testing data
- `GET /api/assembly/scores` - Get assembly scores

## 🐳 Docker Deployment

### Production Deployment

```bash
# Build and start all services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Service Health Checks

- **Backend**: `curl http://localhost:5000/api/health`
- **Frontend**: `curl http://localhost:3000`
- **Nginx**: `curl http://localhost:80`

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Helmet.js security headers
- Environment-based configuration (no hardcoded secrets)
- Comprehensive .gitignore for sensitive files
- Example data files (no real data in repository)

## 📊 Data Privacy

- User data is encrypted and protected
- Database credentials are environment-specific
- SSL certificates for HTTPS
- No sensitive data in repository
- All passwords and secrets use environment variables
- Example data files for reference only
- Comprehensive security checks included

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the bioinformatics and proteomics research community
- Inspired by the need for standardized benchmarking in antibody sequencing
- Thanks to all contributors and researchers in the field

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation in the `/docs` folder

---

**AbNovoBench** - Advancing antibody de novo peptide sequencing through comprehensive benchmarking. 