# Atempo

**Find your own way forward.**

## 1. Project Overview

Atempo is a website designed to help people track their activities, organize their goals, and recognize their own energy and productivity patterns.

### Why was Atempo created?

Many habit-tracking tools use rigid structures that can make us feel as though we must complete all our activities 100% to consider the day successful.

However, people do not always have the same level of energy, motivation, or availability. Some days are highly productive, others require less effort, and some are simply meant for rest. All of these are part of life.

Atempo was created in response to this need: a more flexible and mindful approach to personal tracking. It allows users to record activities, identify their energy levels, organize goals, and observe patterns without turning productivity into a constant demand.

Its purpose is to help people understand themselves better and find a way forward that adapts to their own pace.

## 2. Tools Used

Tool| How it was used
Lovable| Website development with AI assistance through instructions and prompts.
ChatGPT| Support with conceptualization, idea organization, instruction structuring, and documentation.
Figma| Interface design and prototyping before implementation.
GitHub| Source code storage, version control, and project organization.

## 3. Development Prompt

A structured prompt was created to guide the AI, defining its role, tasks, context, and design and functionality requirements.

Main prompt used in Lovable:

"PROJECT: ATEMPO — COMPREHENSIVE WEBSITE DEVELOPMENT

1. ROLE AND OBJECTIVE

Act as a senior digital product development team specializing in UX/UI, web design, frontend, backend, databases, accessibility, and user experience.

Your task is to transform the Figma mockups provided as visual references and the specifications in this document into a fully functional, complete, responsive, and visually consistent website.

The project is called Atempo.

Tagline: “Find your own way forward.”

Description: “A tool to recognize your rhythms, organize your priorities, and move forward mindfully.”

Atempo is a tool for tracking activities, personal energy, and goals. It does not aim to promote extreme productivity or judge users for resting. Its purpose is to help them recognize their rhythms and understand how they distribute their energy.

IMPORTANT: Do not build only a static mockup. Implement the interactions, calculations, navigation, storage, and functionality described below.

2. VISUAL REFERENCES AND BRAND IDENTITY

Use the Figma screenshots and mockups as the primary reference for appearance, composition, hierarchy, and layout. Do not copy them blindly: if you find inconsistencies between screens, apply the design rules in this document.

Visual identity:

- Mist green background: #E8F0EC.
- Soft green: #C8DCD3.
- Main mineral green: #39796F.
- Terracotta: #D58B78.
- Greenish charcoal for text: #34433E.
- Surfaces: #F1F3EF.
- Headings: Fraunces Bold.
- Body text, buttons, forms, and statistics: DM Sans.

Use mineral green for primary actions and selected elements. Terracotta should be an accent, not the dominant color. Maintain sufficient contrast and avoid relying on color alone to communicate information.

Logo: a simple, open letter A constructed with curved strokes. Do not replace it with plants, clocks, lightning bolts, infinity symbols, or checkmarks.

Style: warm, human, professional, minimalist, and technological without feeling cold. Avoid gradients, excessive shadows, generic AI decorations, and repetitive cards.

Keep the energy colors independent from the brand palette:

- Intense: fuchsia.
- Moderate: blue.
- Light: green.
- Diverse: yellow.
- Rest: gray.
- No record: neutral calendar background.

Do not change these colors to match the brand identity palette.

3. STRUCTURE AND NAVIGATION

The website must contain five main sections:

1. Home.
2. Calendar.
3. Daily Log.
4. Goals.
5. Analytics.

Desktop layout:

- Persistent left sidebar with the logo and the five sections.
- User profile in the upper-right corner.
- The active section must always be highlighted using the same dark mineral green background.
- Inactive sections must maintain a consistent neutral style.
- All navigation buttons must share the same dimensions, typography, borders, spacing, and behavior.

Do not use different navigation styles between screens. Any inconsistencies observed in the mockups must be corrected.

The profile must provide access to My Account, Settings, and Log Out.

Mobile layout:

- Do not use a bottom navigation bar that makes Atempo look like a native application.
- Use a compact dropdown menu from the upper-left corner with the same five sections.
- Keep access to the user profile.
- Adapt cards, charts, forms, and tables to small screens without sacrificing readability.

Initial behavior:

- First visit: open Home.
- Returning registered user: open Calendar.
- After authenticating through a modal, return to the section the user was previously viewing.
- Preserve any temporary data the user created before authentication.

4. HOME

Create a welcome screen that has not yet been developed in the mockups.

It must include:

- Atempo logo and name.
- Tagline: “Find your own way forward.”
- A brief description of its purpose.
- Primary button: “Explore Atempo”, which navigates to Calendar.
- Secondary button: “Start organizing my goals”, which navigates to Goals.
- Visual sections explaining the four main possibilities: tracking activities, organizing goals, recognizing personal rhythms, and reviewing progress.

The design must convey calmness, clarity, and trust. It must not look like an aggressive commercial landing page.

5. CALENDAR

Build an interactive monthly calendar.

Features:

- Navigate between months and years.
- Identify each day according to its energy category.
- Display all six energy categories.
- Select a day to view its information.
- “Log Today” button.
- Details panel for the selected day.
- Display activities, duration, and notes when available.

Rules:

- Each date must have only one overall energy status.
- The daily category is automatically determined by the predominant category among that day's activities.
- If two or more categories are tied, the result is Diverse.
- If the user explicitly marks the day as rest, the day must be classified as Rest and contain no activities.
- If there is no log and no explicit rest entry, the day must be classified as No Record.
- Diverse is not equivalent to No Record.
- No Record is not equivalent to Rest.

6. DAILY LOG

Create an interactive form to record activities for each date.

Each activity must allow the user to:

- Select an activity.
- Assign its energy category: Intense, Moderate, or Light.
- Record its duration in minutes.
- Edit or delete the activity.

Include:

- Optional daily notes.
- “Mark as Rest” option.
- Save Log button.
- Cancel button.
- Ability to edit and delete existing logs.

Display a details panel containing:

- Date.
- Number of activities.
- Total duration.
- Save time or last updated time.
- Name of each activity.
- Energy category.
- Individual duration.
- Percentage distribution by category.

Daily percentages must be calculated according to the number of activities in each category relative to the total number of activities for that day. Total duration must be calculated separately.

If the user marks the day as Rest, activities must not be recorded simultaneously. If there are no activities and no explicit rest entry, the day must remain No Record.

The interface must include supportive messages such as: “Your energy changes every day. This log is a way to listen to yourself, not to evaluate yourself.”

7. GOALS

Build a section with three groups:

Ideas

- Goals that the user does not want to activate yet.
- Allow users to create, edit, delete, and move goals to In Progress.

In Progress

- Maximum of three simultaneous goals.
- Display a counter, for example, 2 of 3.
- Each goal must include a name, required energy level, optional description, and progress.
- Display a progress bar and percentage.
- Allow users to move goals back to Ideas or mark them as completed.
- Do not allow a fourth goal to be activated while three goals are already in progress.

Completed

- Display completed goals and their completion dates.
- Allow users to view their history.
- Allow users to move a goal back to Ideas or In Progress if they change their minds.
- If a goal returns to In Progress, preserve its previous completion history.

Goal creation form:

- Goal name, maximum 60 characters.
- Optional description.
- Required energy: Intense, Moderate, or Light.
- When created, the goal must initially be saved under Ideas.
- Clearly display the selected status and energy level.

Progress colors:

- Intense: fuchsia.
- Moderate: blue.
- Light: green.

Do not confuse the 60-character limit for goal names with a limit on the total number of goals. Do not establish a general maximum number of goals that has not been specified.

The completed goals counter in Analytics must be calculated using real data.

8. MONTHLY ANALYTICS

Build a dynamic statistics section.

Allow users to select a month and year.

Display four indicators:

- Logged Days.
- Monthly Coverage.
- Rest Days.
- Completed Goals.

Include a monthly distribution chart showing how many days belong to each of the following categories:

Intense, Moderate, Light, Diverse, Rest, and No Record.

Mathematical rules:

- The denominator must be the total number of days in the selected month.
- Each day must be counted only once.
- Percentages must add up to 100%, considering all six categories.
- Days with no records must also be displayed.
- A rest day must not be counted as a day with no record.

Include a comparison with the previous month:

- Energy distribution.
- Logged days.
- Coverage.
- Completed goals.

Use the same colors and category order in all charts.

Add two informational sections:

1. “What Your Month Tells You”: a reflection based on actual data, identifying the most frequent category, rest days, and diverse days.
2. “Reasons to Celebrate”: display goals completed during the month and their completion dates.

Reflections must be neutral and supportive. Do not attribute psychological causes or provide diagnoses. Do not judge users for having fewer logs or more rest days.

Charts, indicators, and comparisons must update automatically whenever logs, goals, or the selected month change. Do not use fixed statistics.

9. AUTHENTICATION AND ACCOUNT

Include:

- Account registration.
- Log in.
- Password recovery.
- Log out.
- Account settings.
- Account and data deletion, with confirmation.

Visitors must be able to explore Atempo without registering.

They must be able to create temporary logs and goals as visitors. When attempting to save information persistently, display a modal offering the options to create an account or log in.

The modal must explain that an account allows users to preserve their logs, goals, and progress.

If a visitor authenticates:

- Preserve temporary data.
- Migrate it to their account.
- Save it automatically.
- Return the user to the section they were viewing.

Do not lose information during this process.

Use secure authentication and persistent storage linked to each user. If a backend is required, use Supabase when available and properly configure authentication, the database, and user-specific access permissions.

Never expose private keys in the frontend. Do not simulate authentication or persistence using fake buttons.

If an integration requires external credentials or authorization, clearly identify what configuration is missing and prepare the integration without claiming it is complete.

10. INTERACTIONS AND ANIMATIONS

Atempo should feel fluid, not static, but animations must be subtle.

Implement:

- Brief transitions when switching sections.
- Consistent visual changes when selecting a section.
- Hover, focus, and pressed states for buttons.
- Very subtle elevation effects for interactive cards.
- Progressive chart appearance when entering Analytics.
- Single-play animations when displaying circular charts, without continuous rotation.
- Percentages that smoothly count up to their actual values.
- Progress bars that update when a goal changes.
- Smooth transitions when opening and closing modals.
- Visual confirmations when saving or deleting information.

Do not use permanent animations, exaggerated movements, blinking, or distracting effects. Respect the system's reduced-motion preference.

All interactions must have a real function. No button should be decorative if it appears to be functional.

11. DATA AND STATES

Create empty states and populated states.

Demo data must be clearly identified as examples. It must not be confused with real user information or appear as personal records after an account is created.

Prepare the following views:

- Empty calendar and calendar with logs.
- Empty and completed daily logs.
- Empty goals and goals with examples.
- Analytics with no data and Analytics with examples.
- Log-in and registration screens.
- Authentication modal.

When no data exists, display useful messages and actions to help users get started. Do not display misleading charts or invented statistics as if they were real.

12. QUALITY, RESPONSIVENESS, AND VALIDATION

The website must work correctly on desktop, tablet, and mobile.

Verify:

- Navigation between the five sections.
- Forms and validations.
- Creation, editing, and deletion of logs.
- Energy category calculations.
- Percentage calculations.
- Rest days and days with no records.
- In-progress goal limits.
- Goal history.
- Monthly comparison.
- Authentication and persistence.
- Data preservation when logging in.
- Responsive design.
- Loading, error, and confirmation states.

Avoid date errors, calculation errors, duplicate records, and data loss. Handle local dates correctly and account for months of different lengths and leap years.

Organize the code into reusable components and maintain a clear structure. Use technologies compatible with the Lovable environment.

13. FINAL INSTRUCTIONS

Before finishing:

1. Review all screens and their visual consistency.
2. Check that navigation is uniform.
3. Verify that every button and form performs a real action.
4. Ensure charts use dynamic information.
5. Test the main user flows as both a visitor and a registered user.
6. Fix any errors you find.
7. Do not remove features to simplify the project without explaining the limitation.

Do not invent new features, commercial sections, subscriptions, or payment systems. The possibility of commercializing Atempo will be considered in the future, but it is not part of this version.

Do not redesign the concept or replace the visual identity. Use the provided references and this document as your guide.

EXPECTED RESULT: A website called Atempo, visually consistent with the mockups, responsive, and functional, with complete navigation, activity logs, goals, analytics, authentication, and data persistence. It should feel like a real digital product: simple, warm, and trustworthy."

## 4. Published Website

Project name: Atempo

Public website link:

https://pixel-perfect-reverie-70.lovable.app/calendario

## 6. Credits and Authorship

Project: Atempo
Creator and author: Xymena Krystel Domínguez Carmona
Location:  Veracruz, México
Role: Conceptualization, UX/UI design, AI-assisted development direction, functional testing, and documentation.
Program: Vibe Coding
Organizations: Tecnolochicas México and Fundación Televisa
Generation: First Generation
Format: Online
Year: 2026
Documentation date: November 1, 2026

This project was conceptualized, designed, and developed with the assistance of artificial intelligence as part of the Vibe Coding program by Tecnolochicas México, an initiative of Fundación Televisa.

© 2026 Xymena Krystel Domínguez Carmona. All rights reserved.
