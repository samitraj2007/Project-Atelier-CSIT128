# ATELIER — Digital Art Museum

A full-stack web application built for a University Project.

## Features

- Public gallery browsing and individual artwork detail pages
- Artist submission form with client + server-side validation
- Admin moderation panel with verify/reject workflow
- Session-based authentication with bcrypt password hashing

## Tech Stack

Node.js · Express · MySQL · Vanilla JavaScript · HTML/CSS

## Setup

1. Clone the repo: `git clone https://github.com/samitraj2007/Project-Atelier-CSIT128.git`
2. Run `npm install`
3. Create MySQL database: `CREATE DATABASE atelier;`
4. Import schema: `mysql -u root -p atelier < sql/schema.sql`
5. Copy `.env.example` to `.env` and fill in your credentials
6. Create the uploads directory: `mkdir public/uploads/artworks`
7. Run `npm start` — server starts at `http://localhost:3000`

## Notes

- Uploaded artwork images are stored in `public/uploads/artworks/` and are excluded from version control
- Admin credentials are set via the `.env` file — see `.env.example` for required fields