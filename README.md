# LearnDeck

**Your personal library for online learning resources.**

LearnDeck is a mobile-first web application for saving, organizing, searching, and revisiting video lectures, playlists, and other learning resources from one place. It is designed to make your learning collection easier to manage without repeatedly searching through YouTube or browser history.

**Live application:** https://mylearndeck.web.app/  
**GitHub repository:** https://github.com/ankitkmr150802/Personal-Learning-Library

## Features

- **Private access:** Firebase Authentication with email and password. Public registration is not part of the intended application flow.
- **Unified library:** Manage individual lectures and playlists in one interface.
- **Quick search:** Find resources by title, topic, tags, and other supported metadata.
- **Library filters:** Browse all resources, lectures, playlists, watched items, unwatched items, and your watchlist.
- **Watchlist:** Keep important learning resources easy to find.
- **Watched status:** Track which resources you have completed.
- **Duplicate detection:** Warn when an existing resource URL is added again.
- **Quick actions:** Copy resource links, update watched status, and open original resources.
- **Responsive interface:** Designed for mobile phones, tablets, and desktop browsers.
- **Theme support:** Switch between light and dark modes.
- **Persistent storage:** Store resource records in Cloud Firestore so they can remain available across sessions and devices, subject to authentication and database configuration.
- **Thumbnail fallback:** Resource cards should remain identifiable by title and metadata even when a thumbnail is unavailable.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML5 and Tailwind CSS |
| JavaScript | Vanilla JavaScript with ES modules |
| Icons | SVG icons |
| Typography | Inter font |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |

## Project Structure

The repository uses a static frontend structure with application files inside the `public/` directory.

```text
Personal-Learning-Library/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   └── firebase-config.js
│   ├── index.html
│   ├── login.html
│   ├── privacy.html
│   └── terms.html
├── .firebaserc
├── firebase.json
├── firestore.rules
└── README.md
```

### Important files

- [`public/index.html`](https://github.com/ankitkmr150802/Personal-Learning-Library/blob/main/public/index.html): Main application interface.
- [`public/login.html`](https://github.com/ankitkmr150802/Personal-Learning-Library/blob/main/public/login.html): Login page.
- [`public/css/styles.css`](https://github.com/ankitkmr150802/Personal-Learning-Library/blob/main/public/css/styles.css): Application styling.
- [`public/js/app.js`](https://github.com/ankitkmr150802/Personal-Learning-Library/blob/main/public/js/app.js): Main application logic.
- [`public/js/firebase-config.js`](https://github.com/ankitkmr150802/Personal-Learning-Library/blob/main/public/js/firebase-config.js): Firebase initialization and client configuration.
- [`firestore.rules`](https://github.com/ankitkmr150802/Personal-Learning-Library/blob/main/firestore.rules): Firestore access-control rules.
- [`firebase.json`](https://github.com/ankitkmr150802/Personal-Learning-Library/blob/main/firebase.json): Firebase Hosting and deployment configuration.
- [Privacy Policy](https://mylearndeck.web.app/privacy.html): Privacy information.
- [Terms and Conditions](https://mylearndeck.web.app/terms.html): Application terms.

## Getting Started

### Prerequisites

- Git
- A modern web browser
- A Firebase project with Authentication and Cloud Firestore configured
- Firebase CLI for deployment

### 1. Clone the repository

```bash
git clone https://github.com/ankitkmr150802/Personal-Learning-Library.git

cd Personal-Learning-Library
```

### 2. Configure Firebase

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Create or select your Firebase project.
3. Enable the Email/Password sign-in provider under Authentication.
4. Create a Cloud Firestore database.
5. Register a web application in your Firebase project settings.
6. Configure the project using the Firebase web configuration values.

### 3. Add Firebase configuration

Open:

`public/js/firebase-config.js`

Configure it using your Firebase project's web application settings. Follow the initialization pattern already used in the project.

Firebase web configuration is intended for client-side use, but it is not an authorization mechanism. Never put service-account credentials, private keys, or privileged server secrets in this file.

### 4. Configure database security

Review `firestore.rules` and deploy restrictive rules before using real data.

Access must be limited to explicitly authorized users. Do not rely on `request.auth != null` alone if every authenticated account should not have access to this private library.

Verify that unauthorized users cannot read, create, modify, or delete library records. Keep database authorization enforced by Firestore rules, not just by hiding frontend controls.

### 5. Run locally

Because the application uses JavaScript modules, serve the project over HTTP rather than opening the HTML file directly.

You can use the Firebase emulators for local development, or use a local static server configured for the project's existing Firebase setup.

For Firebase emulators, install the Firebase CLI and initialize the required emulators if they are not already configured.

## Deployment

Authenticate with Firebase:

```bash
firebase login
```

Check that the selected Firebase project is correct:

```bash
firebase use
```

Deploy the configured Hosting site and Firestore rules:

```bash
firebase deploy --only hosting,firestore:rules
```

**Before deployment:** Review the active Firebase project, security rules, authentication settings, and production configuration. Do not deploy unreviewed rules to a production database.

The live application is available at:

https://mylearndeck.web.app/

## Security and Privacy

LearnDeck is intended for personal learning resources and restricted access.

- Keep account access limited to explicitly authorized users.
- Enforce access control through Firebase Authentication and Firestore Security Rules.
- Never commit private credentials, service-account keys, or sensitive environment values.
- Validate user-provided URLs and metadata.
- Review dependencies and configuration before production deployment.
- Do not claim that the application has passed a security audit unless testing has actually been completed.

For privacy information, visit the [Privacy Policy](https://mylearndeck.web.app/privacy.html).

For usage terms, visit the [Terms and Conditions](https://mylearndeck.web.app/terms.html).

## Contributing

This is a personal learning project. If you propose changes, keep the implementation simple, maintainable, mobile-friendly, and security-conscious.

## Project

**LearnDeck**  
Repository: https://github.com/ankitkmr150802/Personal-Learning-Library  
Live application: https://mylearndeck.web.app/
