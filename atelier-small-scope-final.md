# ATELIER

```md
# ATELIER — Small Dynamic Luxury Art Publishing Website Specification

## Cover Page

**Project Title:** ATELIER  
**Tagline:** Where art finds its permanence.  
**Project Type:** Small dynamic website integrated with MySQL  
**Tech Stack:** HTML, CSS, Vanilla JavaScript, Node.js, MySQL  
**Design Direction:** Luxury editorial web design inspired by ZARA, Amouage, Louis Vuitton, and modern niche fashion aesthetics  
**Project Goal:** A graphically polished, small university project that earns full marks while staying manageable in scope.

---

## Table of Contents

1. Problem Statement and Description  
2. Project Scope  
3. Feature List  
4. Design System  
5. Page Specifications  
6. Database Schema  
7. Dynamic Behavior and Self-Organizing Museum Logic  
8. Backend Routes  
9. Form Validation Rules  
10. Admin Authentication Rules  
11. Required External Files  
12. Images and Logo Requirements  
13. Environment Variables  
14. Suggested File Structure  
15. Rubric Alignment Checklist

---

## 1. Problem Statement and Description

### Problem Statement
Independent artists often lack a simple but elegant online platform where they can submit artwork for review and have approved works displayed professionally. Most existing options either feel too commercial, too social, or visually generic.

### Proposed Solution
ATELIER is a small luxury-style art publishing website where visitors can explore verified artworks, artists can submit artwork without creating accounts, and admins can review submissions before publishing them into the digital museum.

### Description of the Website
The website is a **small dynamic web project** with a polished visual identity and a limited feature set. It focuses on three main flows:
- Public browsing of the brand and museum
- Public artwork submission form
- Admin review and publishing workflow

This keeps the project suitable for university while still demonstrating dynamic pages, MySQL integration, Node.js files, form validation, and a premium user interface.

---

## 2. Project Scope

### Included
- Home page
- Museum page
- Artwork detail page
- Submit artwork page
- Admin login page
- Admin dashboard page
- Dynamic MySQL integration
- File upload for artwork images
- Artwork verification and rejection workflow
- Automatic museum reorganization when a new artwork is verified

### Excluded
- No user registration
- No artist accounts
- No public login
- No comments
- No likes
- No shopping cart
- No payments
- No analytics dashboard
- No messaging
- No advanced CMS features
- No cookie consent system
- No persistent login

---

## 3. Feature List

### Public Features
- View the home page with company description and featured works
- Browse the digital museum of verified artworks
- Open a full artwork detail page
- Submit artwork without logging in
- Receive a thank-you confirmation after submission

### Admin Features
- Log in through a simple admin-only login page
- View pending artwork submissions
- Preview submission details
- Verify and publish an artwork
- Reject an artwork

### Database Features
- Save submissions to MySQL
- Save admin accounts to MySQL
- Update artwork status dynamically in MySQL
- Show only verified artworks publicly

---

## 4. Design System

### Visual Direction
The website must look **graphically refined, warm, editorial, and elegant**. It should feel closer to a luxury fashion brand site than a student template.

### Design Principles
- Warm luxury palette
- Strong typography hierarchy
- Quiet whitespace
- Image-first layout
- Minimal interface chrome
- Elegant asymmetry in selected sections
- No “AI-generated” aesthetic

### Color Palette
```css
:root {
  --color-bg: #f5f3ef;
  --color-surface: #f9f7f4;
  --color-surface-offset: #edeae4;
  --color-text: #1a1816;
  --color-text-muted: #7a7671;
  --color-text-faint: #b8b4ae;
  --color-accent: #8b4a2f;
  --color-accent-hover: #6d3420;
  --color-border: rgba(26,24,22,0.10);
  --color-overlay: rgba(20,18,16,0.58);
  --color-white: #ffffff;
}
```

### Typography

- **Display Font:** Cormorant Garamond
- **Body/UI Font:** General Sans

### Typography Rules

- Display font only for hero headings, titles, artist names
- Body font for buttons, navigation, labels, forms, metadata
- Left-aligned by default
- Hero heading may be centered if elegant

### Layout Rules

- Maximum content width: 1200px
- Form container width: about 680px
- Full-bleed museum image tiles
- No gradients
- No glowing effects
- No icon circles
- No heavy shadows

---

## 5. Page Specifications

### 5.1 Home Page (`index.html`)

**Purpose:** Introduce the brand and route visitors to the museum or submission page.

**Sections:**

- Header with logo and nav links
- Hero section with editorial headline and CTA
- Short about/company description section
- Featured verified works preview section
- Submission CTA strip
- Footer

### 5.2 Museum Page (`museum.html`)

**Purpose:** Display all verified artworks from MySQL.

**Requirements:**

- Dynamic artwork grid loaded from the database
- Full-bleed artwork images
- Hover overlay with title and artist name
- Clicking a tile opens the artwork detail page
- Grid must automatically update when new verified artworks are added

### 5.3 Artwork Detail Page (`artwork.html`)

**Purpose:** Show one artwork in detail.

**Content:**

- Large artwork image
- Artist name
- Artwork title
- Year
- Medium
- Description

### 5.4 Submit Artwork Page (`submit.html`)

**Purpose:** Allow artists to submit artwork without logging in.

**Fields:**

- Artist name
- Email
- Artwork title
- Year created
- Medium
- Description
- Artwork image upload
- Originality checkbox

**Success Result:**

- Thank-you message
- Reference ID
- Submission saved as `pending`

### 5.5 Admin Login Page (`admin-login.html`)

**Purpose:** Let admins log in to manage submissions.

**Fields:**

- Username
- Password

### 5.6 Admin Dashboard (`admin-dashboard.html`)

**Purpose:** Let admins moderate pending artworks.

**Sections:**

- Pending submissions table
- Preview panel or modal
- Verify button
- Reject button

---

## 6. Database Schema

### Table 1 — `admins`

```sql
CREATE TABLE admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table 2 — `artworks`

```sql
CREATE TABLE artworks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  artist_name VARCHAR(150) NOT NULL,
  artist_email VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  year_created YEAR NOT NULL,
  medium ENUM('Oil','Watercolour','Digital','Photography','Sculpture','Mixed Media','Other') NOT NULL,
  description TEXT NULL,
  image_path VARCHAR(500) NOT NULL,
  status ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by INT UNSIGNED NULL,
  FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL
);
```

### Database Rules

- Only verified artworks appear on the museum page
- Pending artworks only appear in the admin dashboard
- Rejected artworks stay hidden from the museum
- Uploaded image files are stored in `/public/uploads/artworks/`
- Only relative image paths are stored in MySQL

---

## 7. Dynamic Behavior and Self-Organizing Museum Logic

The museum must **self-organize automatically** whenever a new artwork is verified.

### Required Logic

- The museum page fetches all verified artworks from MySQL every time it loads.
- Verified artworks are ordered by newest review first:

```sql
ORDER BY reviewed_at DESC, id DESC
```

- This means that when an admin verifies a new artwork, it automatically appears in the museum in the correct position without manually editing HTML.
- The featured works section on the home page can automatically display the latest 3 or 4 verified works.
- No hardcoded museum cards should be required after the dynamic rendering is set up.

This is important for full marks because it proves the website is dynamically connected to MySQL and can reorganize itself as data changes.

---

## 8. Backend Routes

### Public Routes

- `GET /api/home-featured` → returns latest verified artworks for home page
- `GET /api/museum` → returns all verified artworks
- `GET /api/artworks/:id` → returns single verified artwork
- `POST /api/submit-artwork` → accepts artwork submission

### Admin Routes

- `POST /api/admin/login` → validates login
- `GET /api/admin/pending` → returns pending submissions
- `POST /api/admin/verify/:id` → verifies and publishes artwork
- `POST /api/admin/reject/:id` → rejects artwork

### Backend Rules

- Use parameterized SQL queries only
- Use Node.js files to connect HTML pages with MySQL
- Return JSON responses
- Keep the server small and simple

---

## 9. Form Validation Rules

### Client-Side Validation

- Name required
- Email required and valid
- Artwork title required
- Year required and must be numeric and sensible
- Medium required
- Image required and must be JPG/PNG/WEBP
- Image max size 10MB
- Originality checkbox required
- Description max 500 characters

### Server-Side Validation

Repeat all validations on the backend before inserting into MySQL.

### Error UI

- Show inline error messages below fields
- Do not rely only on browser default validation bubbles

---

## 10. Admin Authentication Rules

### Authentication Model

This project uses a **small and simple login flow**.

### Rules

- Admin logs in through the login page
- Login is checked against MySQL
- After login, admin can access dashboard actions during that visit
- No persistent login between separate visits
- No remember-me feature
- No signup
- No public login

### Academic Simplicity Note

This login system should stay simple and suitable for the scale of a university project. Do not overengineer it.

---

## 11. Required External Files

### HTML Files

- `index.html`
- `museum.html`
- `artwork.html`
- `submit.html`
- `admin-login.html`
- `admin-dashboard.html`

### CSS Files

- `css/tokens.css`
- `css/base.css`
- `css/components.css`
- optional page-level CSS files if needed

### JavaScript Files

- `js/home.js`
- `js/museum.js`
- `js/artwork.js`
- `js/submit.js`
- `js/admin-login.js`
- `js/admin-dashboard.js`

### Node.js Files

- `server/app.js`
- `server/db.js`
- `server/routes.js`
- `server/upload.js`
- `server/auth.js`

All JavaScript files must be **external files**, not large inline scripts, to satisfy the rubric.

---

## 12. Images and Logo Requirements

- Include a custom ATELIER logo
- Use suitable artwork images
- Use at least a few sample verified artworks for demonstration
- Ensure all images are properly displayed in the museum and detail pages
- Include a polished visual identity suitable for full marks in the design section

---

## 13. Environment Variables

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=atelier_user
DB_PASSWORD=replace_me
DB_NAME=atelier
UPLOAD_DIR=./public/uploads/artworks
MAX_UPLOAD_MB=10
```

---

## 14. Suggested File Structure

```text
atelier/
├── public/
│   ├── index.html
│   ├── museum.html
│   ├── artwork.html
│   ├── submit.html
│   ├── admin-login.html
│   ├── admin-dashboard.html
│   ├── css/
│   │   ├── tokens.css
│   │   ├── base.css
│   │   └── components.css
│   ├── js/
│   │   ├── home.js
│   │   ├── museum.js
│   │   ├── artwork.js
│   │   ├── submit.js
│   │   ├── admin-login.js
│   │   └── admin-dashboard.js
│   └── uploads/
│       └── artworks/
├── server/
│   ├── app.js
│   ├── db.js
│   ├── routes.js
│   ├── upload.js
│   └── auth.js
├── sql/
│   └── schema.sql
├── .env.example
└── package.json
```

---

## 15. Rubric Alignment Checklist

### Cover Page and Table of Contents

- Include both in the report

### Problem Statement and Description

- Clearly explain the problem and website purpose

### HTML Files

- Create all required HTML pages

### JavaScript Files

- Create all required external JavaScript files

### Form Validation

- Implement strong client-side and server-side validation

### CSS Files

- Use multiple external CSS files

### Images/Logo

- Include suitable artwork images and a logo

### UI Design and Flow

- Ensure strong and polished user interface design
- Ensure easy page-to-page navigation and proper flow

### Dynamic Pages with MySQL

- Museum page loads verified artworks dynamically
- Home featured works load dynamically
- Submission writes to MySQL
- Admin dashboard loads pending works dynamically
- Museum self-organizes automatically after new verification

### MySQL Database / JSON Creation

- Create proper MySQL relational tables
- Integrate tables with website pages

### Node.js Files

- Create all required Node.js files and connect them with the frontend and MySQL.

