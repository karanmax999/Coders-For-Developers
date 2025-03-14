# Coders for Developers (CFD)

A modern web platform connecting coders and developers for collaboration, job opportunities, and internships.

## 🚀 Features

- **Modern UI/UX**: Responsive design with animations and modern styling
- **Google Authentication**: Secure sign-in with Google OAuth
- **Job & Internship Listings**: Browse available opportunities
- **Developer Discovery**: Find and connect with other developers
- **Contact Form**: Reach out to the CFD team
- **FAQ Section**: Get answers to common questions

## 📋 Pages

- **Home**: Landing page with platform overview
- **Discover**: Find and connect with developers
- **Jobs**: Browse job listings
- **Internships**: Find internship opportunities
- **FAQ**: Frequently asked questions
- **Contact**: Get in touch with the CFD team

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Express
- **Authentication**: Google OAuth
- **Styling**: Custom CSS with animations
- **Security**: Helmet, CORS, and other security best practices
- **Performance**: Compression, caching, and optimized assets

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd CFD
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file based on the `.env.example` template
   - Add your Google OAuth credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## 📝 Project Structure

```
CFD/
├── .env                  # Environment variables
├── package.json          # Project dependencies and scripts
├── server.js             # Express server configuration
├── modern-script.js      # Modern JavaScript functionality
├── script.js             # Legacy JavaScript code
├── styles.css            # CSS styles
├── *.html                # HTML pages
├── assets/               # Images and other static assets
└── README.md             # Project documentation
```

## 🔒 Security

This project implements several security best practices:
- Helmet for secure HTTP headers
- CORS protection
- Environment variables for sensitive data
- JWT token validation
- XSS protection

## 🚀 Deployment

The application can be deployed to various platforms:

### Heroku
```bash
heroku create
git push heroku main
```

### Netlify
Connect your GitHub repository to Netlify for automatic deployments.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 