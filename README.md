# Gee Innovixus - Academic Project Consultancy Platform



A comprehensive web application for academic project consultancy and research publication services, built with Next.js 16.4.2, MongoDB, and modern web technologies.

## 🚀 Features

### Public Website

- **Modern Homepage** with animated statistics and service showcase
- **Project Gallery** with advanced filtering and search
- **Service Pages** for different consultancy offerings
- **Contact Forms** with inquiry management
- **Blog System** for content marketing
- **Testimonials** with approval workflow

### Admin Portal

- **Dashboard** with analytics and KPIs
- **Project Management** with CRUD operations
- **Order Management** with status tracking
- **Excel Import** for bulk data management
- **User Management** with role-based access
- **Content Management** for all website content

### Technical Features

- **Authentication** with NextAuth.js
- **File Storage** with Tigris S3
- **Analytics** with Firebase and Vercel
- **Real-time Updates** with WebSocket support
- **Responsive Design** with Tailwind CSS
- **SEO Optimized** with meta tags and structured data

## 🛠️ Technology Stack

### Frontend

- **Next.js 16.4.2** with App Router
- **React 19** with hooks and context
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **NextUI** for UI components
- **Lucide React** for icons

### Backend

- **Next.js API Routes** for serverless functions
- **MongoDB** with Mongoose ODM
- **NextAuth.js** for authentication
- **Joi/Yup** for validation
- **Multer** for file uploads

### Storage & Analytics

- **Tigris S3** for file storage
- **Firebase Analytics** for user behavior
- **Vercel Analytics** for performance
- **Cloudinary** for image optimization

### Development Tools

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Git** for version control

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 24.x** (required by the project and used for Vercel deployments)
- **npm** or **yarn** or **pnpm**
- **MongoDB** (local or Atlas)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gee-innovations
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Copy the environment template to the ignored local environment file and configure
your local MongoDB URI, a unique NextAuth secret, and private admin credentials:

```bash
cp env.example .env.local
```

Use a local MongoDB instance and the dedicated development database:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/geeinnovixus_dev
NEXTAUTH_SECRET=<unique-local-secret>
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=<your-private-admin-email>
ADMIN_PASSWORD=<your-private-password-at-least-12-characters>
```

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are developer-supplied provisioning inputs. Do not
commit `.env.local` or paste its values into client-side code. Google and other
third-party sign-in are not enabled. Admin accounts can only be created by the local
provisioning script; the script hashes the password, never prints it, and refuses to
run if any admin already exists.

### 4. Provision the single admin account

Start MongoDB locally, then explicitly create the admin:

```bash
npm run provision:admin
```

### Seed local content

After provisioning the admin, optionally set `SEED_GALLERY_IMAGE_URL_1` and
`SEED_GALLERY_IMAGE_URL_2` in `.env.local` to publicly viewable Google Drive file
links. Then run:

```bash
npm run seed:content
```

This command inserts sample Research, Projects, Services, and Learning Hub records,
plus Gallery examples when public Drive links are configured. It is restricted to the
local `geeinnovixus_dev` database, seeds only empty collections, and skips collections
that already contain records. Replace sample captions and details with accurate content
before publishing.

Run the production build and server:

```bash
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
Sign in at `/auth/signin` with the credentials configured in your ignored `.env.local`.
For development, use `npm run dev` instead of `npm start`.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin portal pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── blog/              # Blog pages
│   ├── contact/           # Contact page
│   ├── projects/          # Project pages
│   ├── services/          # Service pages
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Homepage
├── components/            # Reusable components
│   ├── Navigation.js      # Main navigation
│   ├── Footer.js          # Footer component
│   └── ...
├── lib/                   # Utility libraries
│   ├── auth.js            # NextAuth configuration
│   ├── mongodb.js         # Database connection
│   ├── storage.js         # File storage utilities
│   ├── firebase.js        # Firebase configuration
│   ├── utils.js           # General utilities
│   └── validations.js     # Validation schemas
├── models/                # MongoDB models
│   ├── User.js            # User model
│   ├── Project.js         # Project model
│   ├── Service.js         # Service model
│   ├── AccessRequest.js   # Access Request model
│   ├── Testimonial.js     # Testimonial model
│   └── Inquiry.js         # Inquiry model
└── middleware.js          # Next.js middleware
```

## 🔧 Configuration

### Database Models

The application includes comprehensive MongoDB models:

- **User**: Authentication and user management
- **Project**: Academic project listings
- **Service**: Service offerings
- **Order**: Order management
- **Testimonial**: Client reviews
- **Blog**: Content management
- **Inquiry**: Contact form submissions

### API Routes

- `/api/projects` - Project CRUD operations
- `/api/services` - Service management
- `/api/contact` - Contact form handling
- `/api/testimonials` - Testimonial management
- `/api/upload` - File upload handling
- `/api/admin/excel-import` - Bulk data import

### Authentication

The application uses NextAuth.js with:

- **Credentials Provider** for email/password
- **Google Provider** for OAuth
- **Role-based Access Control** (Admin, Client, Editor)
- **Protected Routes** with middleware

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production

Ensure all environment variables are configured in your deployment platform:

- Database connection strings
- Authentication secrets
- File storage credentials
- Email service configuration
- Analytics keys

## 📊 Analytics Setup

### Firebase Analytics

1. Create a Firebase project
2. Enable Analytics
3. Add your domain to authorized domains
4. Configure the Firebase config in your environment

### Vercel Analytics

Analytics are automatically enabled when deployed on Vercel.

## 🔒 Security Features

- **CSRF Protection** with NextAuth.js
- **Input Validation** with Joi schemas
- **File Upload Security** with type and size validation
- **Rate Limiting** on API routes
- **Environment Variable Protection**
- **SQL Injection Prevention** with Mongoose

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@geeinnovixus.com or create an issue in the repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database solution
- Vercel for hosting and deployment
- All the open-source contributors

---

**Gee Innovixus** - Transforming ideas into groundbreaking solutions with cutting-edge technology.
