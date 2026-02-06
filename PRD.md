# PRD — CircuThai Exercise Programming App

## 1. Product Vision
- **Objective**: Deliver a guided web experience that helps users assemble and execute circulation-friendly exercise sequences optimized for lymphatic drainage.
- **User Benefit**: Simplifies planning, timing, and monitoring of low-impact routines by combining timers, cues, and audio guidance in one place.
- **Health Link**: Encourages consistent movement patterns that stimulate venous return and lymph flow, supporting recovery and preventive care.

## 2. Personas & Use Cases
- **Physiotherapist (Claire, 38)**: Configures patient-specific sequences during consultations, shares them for home use, reviews adherence feedback.
- **Wellness Coach (Marc, 45)**: Builds thematic programs (morning boost, post-travel) and runs them live in group sessions with audio cues.
- **Self-guided Patient (Amélie, 29)**: Stores multiple doctor-recommended routines, runs timers daily with voice prompts and relaxing background music.

### Scenarios
1. **Program Creation**: User browses catalog, selects exercises, assigns durations, saves under a custom name.
2. **Guided Execution**: User launches a program, hears exercise name + duration, watches countdown, hears beep, transitions automatically.
3. **Progress Follow-up**: System logs completed sessions per program; user views history to track adherence.

## 3. Scope & Key Features
### 3.1 Exercise Catalog
- Preloaded list with name, short description, optional static image or animation stub.
- Filters by body zone (legs, arms), intensity, or recommended use.
- **Acceptance Criteria**: Minimum 15 exercises; metadata loads under 1 s; each item editable by admins.
- **Success Metrics**: 80% of created programs use catalog items; average catalog browsing time < 2 min.

### 3.2 Program Builder
- Drag/drop (desktop) or tap-to-add (mobile) interface to assemble a sequence.
- Each exercise duration adjustable (15 s–10 min) and validated.
- Programs saved per user; unlimited drafts.
- **Acceptance Criteria**: Save succeeds offline-first (local) and syncs when online; duration sum displayed; duplicate names prevented.
- **Success Metrics**: >60% of sessions started from saved programs; error rate <2% when saving.

### 3.3 Guided Execution
- Countdown screen with large typography, progress ring, next-exercise preview.
- Text-to-speech or pre-generated audio announces exercise name and duration at start.
- Audible beep at completion, 2-second pause before auto-advance.
- Manual pause/skip controls.
- **Acceptance Criteria**: Audio cue plays within 200 ms of stage start; beep volume configurable; timer drift <250 ms per minute.
- **Success Metrics**: Program completion rate >75%; average interruptions <1 per session.

### 3.4 Optional Background Music
- Users link a royalty-free track per program (uploaded file or URL preset library).
- Playback starts with program, independent volume slider, mute toggle.
- **Acceptance Criteria**: Music loops seamlessly; persists across exercise transitions; stopping program halts audio instantly.
- **Success Metrics**: 40% of programs with music enabled; <1% audio playback errors.

### 3.5 User Management / Persistence
- MVP: Firebase Firestore storage with export/import of programs.
- Post-MVP: optional Supabase/Firebase auth (email + magic link) for cross-device sync.
- **Acceptance Criteria**: Local data survives refresh; opt-in sync clearly labeled; GDPR-compliant consent copy.
- **Success Metrics**: 90% retention of stored programs over 30 days; <5% sync support tickets.

## 4. User Experience
- **Flows**: Home → Program list → Builder or Run view. Execution screen shows active timer, next step, cumulative progress.
- **Responsive**: Mobile-first layout (single-column stack) with desktop enhancements (split preview/palette).
- **Accessibility**: WCAG 2.1 AA contrast, keyboard navigation, ARIA labels on controls, captions for audio cues.
- **Feedback**: Toasts for saves/errors, haptic hints on supported devices.

## 5. Technical Constraints
- **Stack**: Next.js 15 (App Router) + React Server Components, hosted on Vercel.
- **Audio**: Web Audio API for cues + Howler.js fallback for compatibility; Service Worker preloading.
- **Persistence**: Firebase Firestore (cloud) MVP, optional Supabase (Postgres) for future multi-tenant needs.
- **Internationalization**: next-intl with FR default, EN secondary.
- **Deployment**: CI via Vercel; feature flags using Vercel Edge Config.

## 6. Non-Functional Requirements
- **Performance**: LCP <2.5 s on 4G, TTI <3 s, audio start latency <300 ms.
- **Compatibility**: Latest 2 versions of Chrome, Safari, Firefox, Edge; iOS 16+, Android 12+.
- **Security**: HTTPS enforced, CSP headers, Firestore security rules + server-side encryption for stored programs.
- **Observability**: Vercel Analytics + Logflare; custom events for program start/complete.

## 7. Roadmap & Milestones
1. **MVP (Month 1)**: Catalog, builder, basic timer with beep, local persistence, FR UI.
2. **Beta (Month 2)**: Voice announcements, responsive polish, analytics instrumentation.
3. **Public Launch (Month 3)**: Optional background music, EN locale, export/import.
4. **Enhancements (Month 4+)**: Cloud sync, personalization (recommended programs), adherence dashboard, wearable integration exploration.

## 8. Risks & Dependencies
- **Music Licensing**: Need curated royalty-free library or user-upload compliance checks.
- **Audio Latency**: Browser autoplay policies; requires user interaction to unlock audio context.
- **Accessibility Compliance**: Voice cues must have text fallback; testing with screen readers required.
- **Data Privacy**: If cloud sync enabled, need DPA, encryption at rest, region selection.
