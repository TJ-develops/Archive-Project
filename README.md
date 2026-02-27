A structured archival platform for documenting major public-interest cases, individuals, organizations, and investigative timelines.

Designed as a research-grade, archive-style system — not a blog, not a news site, not a dashboard.

📌 Overview

ARCHIVE is a structured investigative index built to:

Document major criminal cases

Track individuals (“Figures”) connected to investigations

Maintain timelines and documented events

Store evidence references and legal documents

Present structured, readable, research-focused content

The UI is intentionally minimal and institutional — inspired by legal archives and structured intelligence repositories.

🏗 Architecture
Frontend

Static structured layout

Dark / Light mode toggle

Serif + sans-serif typographic hierarchy

Wikipedia-style section formatting

Structured list-based case index (not card-based)

Backend

Supabase (PostgreSQL)

Row-Level Security (RLS) enabled

Public read policies for archive content

Structured relational schema

🗃 Database Schema Overview
Core Tables
cases

Stores high-level case records.

Title

Year

Category

Location

Status

Summary

Impact data

case_timeline

Chronological case events.

case_players

Individuals involved in each case.

case_evidence

Evidence fragments (audio, photo, logs, etc.)

case_documents

Official filings and referenced materials.

Figures System
figures

Primary individuals database.
Includes:

Identity summary

Legal status

Known associations

Overview

Public impact

figure_sections

Modular content sections:

Background

Activities

Allegations

Legal Proceedings

figure_timeline

Chronological personal timeline.

figure_network

Associates and connected entities.

figure_references

External documentation and source links.

Supporting Tables

organizations

operations

🎨 Design Philosophy

This project intentionally avoids:

Blog-style layouts

Card-heavy UI

Excessive shadows

Modern SaaS aesthetic

Instead it focuses on:

Structured hierarchy

Clear typographic separation

Institutional presentation

Readability over decoration

Minimal but precise interaction

Inspired by:

Wikipedia structural clarity

Legal document formatting

Intelligence-style dossier layouts

🔐 Security Model

Supabase PostgreSQL

Row-Level Security enabled

Public SELECT policies for read-only archive access

Foreign key constraints with cascade deletion

Structured IDs for archival referencing

🌗 Theme System

Global dark/light theme toggle:

Applies to entire site

Preserves contrast for research readability

Infoboxes and archive cards adapt automatically

📂 Project Structure (Example)
/src
  /components
  /pages
  /styles
/database
  schema.sql
  seed.sql
README.md
🚀 Setup

Create a Supabase project.

Run schema.sql.

Apply RLS policies.

Seed initial content.

Connect frontend via SUPABASE_URL and SUPABASE_ANON_KEY.

⚖ Disclaimer

This archive presents documented investigations, charges, and publicly reported material.
Inclusion in the database does not imply judicial guilt unless stated as a conviction.

All content should be based on verifiable public records.

📌 Status

Active development.
UI refinement ongoing.
Case expansion planned.

