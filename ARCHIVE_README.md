# 🗂 ARCHIVE

### Investigative Intelligence Repository

A structured investigative archive built for documenting major criminal
cases, high-profile figures, systemic failures, and documented legal
proceedings.

This is not a blog.\
This is not a media outlet.\
This is a structured research-grade archive.

------------------------------------------------------------------------

## 🎯 Purpose

ARCHIVE exists to:

-   Document major public-interest cases\
-   Structure investigative timelines\
-   Index individuals connected to legal proceedings\
-   Map networks and associations\
-   Preserve documented legal and investigative material\
-   Present information in a structured, readable format

The platform emphasizes clarity, structure, and institutional
presentation over visual noise.

------------------------------------------------------------------------

## 🏛 Design Philosophy

This project intentionally avoids:

-   Blog-style layouts\
-   Card-heavy SaaS interfaces\
-   Overdesigned UI components\
-   Visual clutter

Instead, it focuses on:

-   Structured hierarchy\
-   Institutional typography\
-   Clean dividers over containers\
-   Wikipedia-style readability\
-   Research-oriented layout

The goal:\
Make the content feel archival, not promotional.

------------------------------------------------------------------------

## 🧠 Core Concepts

### Figures

Individuals connected to investigations.

Each figure includes:

-   Identity summary\
-   Structured background\
-   Allegations\
-   Legal proceedings\
-   Timeline\
-   Network associations\
-   Reference documentation

------------------------------------------------------------------------

### Cases

Major investigations and public-interest events.

Each case includes:

-   Case overview\
-   Jurisdiction\
-   Status\
-   Timeline of events\
-   Key players\
-   Evidence fragments\
-   Official documents\
-   Impact analysis

------------------------------------------------------------------------

### Network Mapping

Associations between:

-   Individuals\
-   Organizations\
-   Institutions\
-   Political entities

Structured relational storage allows cross-linking across the archive.

------------------------------------------------------------------------

## 🏗 Architecture

### Frontend

-   Structured list-based layouts\
-   Wikipedia-style content formatting\
-   Global Dark / Light theme toggle\
-   Serif heading hierarchy\
-   Clean institutional spacing\
-   Minimal hover interactions

### Backend

-   Supabase (PostgreSQL)\
-   Relational schema\
-   Foreign key enforcement\
-   Row-Level Security (RLS)\
-   Public read policies for archive data

------------------------------------------------------------------------

## 🗃 Database Schema Overview

### Core Case Tables

-   `cases`\
-   `case_timeline`\
-   `case_players`\
-   `case_evidence`\
-   `case_documents`

### Figure System

-   `figures`\
-   `figure_sections`\
-   `figure_timeline`\
-   `figure_network`\
-   `figure_references`

### Supporting Entities

-   `organizations`\
-   `operations`

All content is modular and relational.

------------------------------------------------------------------------

## 🔐 Security Model

-   PostgreSQL with RLS enabled\
-   Public read-only access via `anon` role\
-   Controlled write operations\
-   Foreign key cascade integrity\
-   Structured archival IDs

The system is built to scale without sacrificing structure.

------------------------------------------------------------------------

## 🌗 Theme System

A global Dark / Light mode toggle:

-   Applies across entire platform\
-   Preserves readability in both modes\
-   Adjusts borders, dividers, and metadata contrast\
-   Keeps typography consistent across themes

No visual distortion between themes.

------------------------------------------------------------------------

## 📁 Example Project Structure

    /src
      /components
      /pages
      /styles

    /database
      schema.sql
      seed.sql

    README.md

------------------------------------------------------------------------

## 🚀 Setup Instructions

1.  Create a Supabase project.\
2.  Execute `schema.sql`.\
3.  Enable Row-Level Security.\
4.  Apply public read policies.\
5.  Run seed data.\
6.  Configure:
    -   SUPABASE_URL\
    -   SUPABASE_ANON_KEY

Frontend connects using Supabase JS client.

------------------------------------------------------------------------

## ⚖ Disclaimer

This archive presents documented investigations, charges, and publicly
available legal records.

Inclusion of an individual or organization does not imply guilt unless
explicitly documented as a conviction.

All entries should be based on verifiable sources.

------------------------------------------------------------------------

## 📌 Current Status

-   Structured archive framework complete\
-   Cases index active\
-   Figures module operational\
-   UI refinement ongoing\
-   Network visualization expansion planned

------------------------------------------------------------------------

## 🔮 Future Enhancements

-   Graph-based relationship visualization\
-   Advanced filtering across entities\
-   Search indexing optimization\
-   Case clustering by jurisdiction\
-   Timeline visualization upgrades\
-   Document preview rendering

------------------------------------------------------------------------

## 🧩 Contribution Guidelines

Contributions should prioritize:

-   Accuracy\
-   Verifiable sourcing\
-   Clean relational structure\
-   Neutral presentation\
-   UI consistency

This is an archive --- not an opinion platform.

------------------------------------------------------------------------

## 📚 Philosophy Behind ARCHIVE

Information loses power when it is buried in noise.

ARCHIVE is built on one principle:

> Structure creates clarity.\
> Clarity creates accountability.
