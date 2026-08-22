PHASE 1 — Generic B2B Showcase App (Whitepaper)
==================================
No network. No auth. Static mock data. This is a reusable whitepaper B2B app —
same screens, same structure, same UX every time. Per-client delivery means
swapping colors, logo, and branding; adding or removing screens as needed.
Goal for this phase: every screen exists, design is locked, app can be demoed
and store screenshots can be taken.

---

Navigation structure
--------------------
Auth stack (no session, just UI):
  Login → any credentials navigate to main app
  Register → fills in company name, industry (dropdown), city/country, email,
             password → shows success alert → navigates back to Login

Bottom tabs (main app):
  Discover | Connections | Messages | Profile


Screens and showcase behavior
------------------------------

LOGIN
  Logo + tagline at top. Email + password fields. "Sign In" button navigates
  to the main tab app on tap — no credential check. "Create one" link goes to
  Register.

REGISTER
  Two sections: Company Information (name, industry picker, city/country) and
  Account Details (email, password). Submit shows a success Alert and navigates
  back to Login. Industry picker is an inline dropdown list — no external
  component.

DISCOVER
  Header: "Discover" title + company count.
  Search bar (decorative — filters the hardcoded list client-side).
  Horizontal scrollable industry filter chips: All | IT | Manufacturing |
  Logistics | Marketing | Finance | Legal | Agriculture | Design | Healthcare.
  FlatList of BusinessCards (letter avatar, name, industry tag, location, size).
  Tapping a card opens BusinessProfile.
  "Connect" action on each card shows a success Alert (no request sent).

BUSINESS PROFILE
  Hero section: colored letter avatar, company name, website, tag row
  (industry, location, size). Sections: About (description), Looking For,
  Details (key-value rows: Industry, Location, Company Size, Website).
  Sticky footer: "Connect with [Name]" button → Alert confirming request
  (does nothing).

CONNECTIONS
  Segmented control: Pending | Connected.
  Pending tab: mock list of outgoing and incoming requests with status badges.
  Connected tab: mock list of approved connections with a "Message" button that
  navigates into the Chat screen for that conversation.
  Tapping a connection card opens the BusinessProfile for that company.

MESSAGES (Conversations list)
  List of conversation rows: colored letter avatar, company name, last message
  preview, timestamp. Tapping a row opens the Chat thread.
  Empty state: "No messages yet — connect with companies to start chatting."

CHAT (Thread)
  FlatList of message bubbles (mine right-aligned, theirs left-aligned).
  Text input bar with send button. In showcase mode the send button appends the
  message to the local list — no network call.

PROFILE
  Hero: app logo/icon, company name, website, industry badge.
  Sections: About, Details (email, industry, location, website key-value rows).
  "Edit Profile" button → Alert "coming soon."
  "Sign Out" button → confirmation Alert → navigates back to Login.
  Info link list: About, Contact, Privacy Policy, Terms of Use, Legal,
  Delete Account (all navigate to a static InfoPage screen).


Mock data shape
---------------
Matches the real DB tables so Phase 2 is a straight swap:

  businesses:   id, name, industry, description, size, location, lookingFor, website, approved
  b2b_requests: id, requesterId, businessId, status, message
                status values: pending_admin | pending_business | approved | rejected
  messages:     id, conversationId, senderId, content, createdAt
  conversations: id, businessId, businessName, lastMessage, lastMessageAt, unread

Hardcoded showcase set:
  10 businesses across IT, Logistics, Finance, Manufacturing, Design,
  Agriculture, Legal, Marketing, Healthcare, Tourism.
  4 connections: 2 pending (1 sent, 1 received), 2 approved.
  2 conversations, each with 4–5 message exchanges.
  1 "my company" record used for the Profile screen and to determine
  which side of a message bubble belongs to the logged-in user
  (MY_COMPANY_ID = 99).


Per-client customisation checklist (Phase 1 → delivery)
---------------------------------------------------------
  [ ] Replace logo asset and app icon
  [ ] Swap primary color and gradient
  [ ] Update app name, tagline, and slug in app.json
  [ ] Replace mock business names/industries/locations with domain-appropriate data
  [ ] Adjust industry filter chip list to match the vertical
  [ ] Update bottom tab labels and icons if needed
  [ ] Remove or add tabs/screens per client brief
# zoemobiletemplateb2b
