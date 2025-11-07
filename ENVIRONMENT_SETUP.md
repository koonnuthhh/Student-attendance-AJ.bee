# Environment Setup Guide

This guide helps you configure the required environment variables for the Student Attendance System.

## Quick Start

1. Copy the example below to create a `.env` file in the `backend/` directory
2. Update the values with your actual credentials
3. Ensure the database is set up (see DATABASE_SETUP.md)
4. Run `npm install` in the backend directory
5. Run `npm run migration:run` to apply database migrations
6. Start the backend with `npm run start:dev`

## Environment Variables

### Database Configuration

```env
# PostgreSQL Database URL (Supabase or self-hosted)
DATABASE_URL=postgresql://username:password@hostname:5432/database_name

# Example for local development:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/attendance_dev

# Example for Supabase:
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### JWT Authentication

```env
# Secret key for signing JWT tokens (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT token expiration time (examples: '15m', '1h', '1d', '7d')
JWT_EXPIRES_IN=1d
```

### SMTP Email Configuration

```env
# SMTP Server Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# SMTP Authentication
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# From address for outgoing emails
SMTP_FROM=noreply@attendance.local
```

#### Popular SMTP Providers

**Gmail:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

**Amazon SES:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

### Application Settings

```env
# Application URL (used in email links)
APP_URL=http://localhost:3000

# Node environment (development, production, test)
NODE_ENV=development
```

## Complete .env Example

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/attendance_dev

# JWT
JWT_SECRET=super-secret-key-please-change-me-in-production
JWT_EXPIRES_IN=1d

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=myapp@gmail.com
SMTP_PASS=myapppassword123
SMTP_FROM=noreply@attendance.local

# App
APP_URL=http://localhost:3000
NODE_ENV=development
```

## Security Best Practices

### 1. JWT Secret
- **Development:** Any string will work
- **Production:** Use a cryptographically secure random string (32+ characters)
- Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 2. Database Credentials
- Never commit database credentials to version control
- Use strong passwords (16+ characters, mixed case, numbers, symbols)
- Restrict database access by IP when possible
- Use SSL/TLS connections in production

### 3. SMTP Credentials
- Use app-specific passwords (not your main email password)
- For Gmail: Enable 2FA, then create an App Password
- Consider using dedicated email service providers for production
- Rotate credentials regularly

### 4. Environment Variables
- Never commit `.env` files to version control
- Use `.env.example` as a template (without actual secrets)
- Use different credentials for dev, staging, and production
- Validate required environment variables on startup

## Testing Email Locally

For local development without real email sending, consider:

### Option 1: MailHog (Recommended)
```bash
# Install MailHog (Windows with Chocolatey)
choco install mailhog

# Run MailHog
mailhog

# Configure .env
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

Access web UI at: http://localhost:8025

### Option 2: Mailtrap
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

Sign up at: https://mailtrap.io

### Option 3: Ethereal (Temporary Testing)
Generate free credentials at: https://ethereal.email/create

## Troubleshooting

### Email Not Sending

**Check SMTP settings:**
```bash
# Test SMTP connection
npm install -g smtp-tester
smtp-tester --host smtp.gmail.com --port 587 --user your@email.com --pass yourpass
```

**Common issues:**
- Wrong port (use 587 for TLS, 465 for SSL)
- Firewall blocking outbound SMTP
- Need app-specific password (Gmail, Outlook)
- "Less secure apps" disabled (old Gmail accounts)

### Database Connection Failed

**Check connection string format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

**Common issues:**
- Missing password URL encoding (use `%40` for `@`, `%23` for `#`, etc.)
- Wrong port (default PostgreSQL is 5432)
- Database doesn't exist (create it first)
- Firewall blocking database port
- Wrong SSL mode for Supabase (should allow SSL)

### JWT Token Issues

**If tokens expire too quickly:**
```env
JWT_EXPIRES_IN=7d  # Increase to 7 days
```

**If authentication fails:**
- Check JWT_SECRET is the same across all instances
- Verify token hasn't expired
- Check system time is synchronized

## Production Deployment

### Required Changes for Production

1. **Generate Strong JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **Use Production Database:**
```env
DATABASE_URL=postgresql://prod_user:strong_password@prod-db.example.com:5432/attendance
```

3. **Configure Production Email:**
```env
SMTP_HOST=smtp.sendgrid.net  # Or your email service
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-production-api-key
SMTP_FROM=noreply@yourdomain.com
```

4. **Set Production Mode:**
```env
NODE_ENV=production
APP_URL=https://your-production-domain.com
```

5. **Enable SSL/TLS:**
- Database connections should use SSL
- SMTP connections should use TLS
- Application should run behind HTTPS proxy

## Support

For issues or questions:
1. Check logs in `backend/` directory
2. Review DATABASE_SETUP.md for database configuration
3. Review IMPLEMENTATION_SUMMARY.md for architecture details
4. Check HOW_TO_USE.md for usage instructions
