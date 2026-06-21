1. Project Overview
This project covers the design and development of a multi-tenant NextJS application that allows
each client (business) to log in to their own isolated workspace. The platform connects to the
client's calendar for appointment-based booking, runs automated email sequences for booking
reminders and invoicing, and tracks the full customer journey from first appointment through job
completion.
2. Tech Stack
➤ Framework: NextJS (full-stack, handles frontend + backend operations) - Hero UI
➤ Hosting: Vercel (including Vercel Cron Jobs for automation sequences, and Vercel Redis
where needed)
➤ Database: Supabase Postgres
➤ ORM: Prisma
➤ Email: Resend (white-labeled to each business's domain, e.g. info@toproofer)

3. Core Features
Multi-User / Multi-Tenant Setup
➤ Each client business has its own isolated login and backend workspace
Calendar Integration
➤ Google Calendar or Outlook connection per business
➤ Event-based 2-way sync: appointments booked via the business's booking link create a
record in our system, and status updates sync back as calendar events change
Automation Sequence System
➤ Default channel: Email (architecture allows additional channels to be added later)
➤ Triggered via scheduled cron jobs (Vercel Cron)
➤ Use cases: booking reminder sequences, invoice follow-up sequences
Booking System
➤ Tracks appointment bookings as they happen
➤ Automatically starts the relevant automation sequence (e.g. booking reminder) once an
appointment is booked
Bookkeeping & Invoicing
➤ Templated invoice creation (e.g. website service, API service)
➤ Price can be set/edited at the time of sending
➤ Sending an invoice triggers the invoice automation sequence
Email Service Setup
➤ All automated emails sent via Resend
➤ White-labeled to send from the business's own domain (e.g. info@toproofer.com)
Customer / Opportunity Tracking
➤ Each customer represents an opportunity within a business
➤ Customers are created automatically (appointment booked) or manually by the business
user
➤ Full journey tracking per customer: invoice sent (direct or sequence step), job started, job
ended, and other key events
Repeatable Templates
➤ Templated booking reminder sequences and invoice sequences that can be reused and
customized per business
