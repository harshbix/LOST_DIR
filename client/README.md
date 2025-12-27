# LOST_DIR Client

The mobile client for the Lost & Found application, built with Expo and TypeScript.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npx expo start
   ```

## Folder Structure
- `app/`: Expo Router screens and layouts.
- `components/`: Reusable UI components.
- `context/`: Authentication and global state.
- `services/`: API communication layers.
- `constants/`: App configuration and theme.
- `hooks/`: Custom React hooks.
- `utils/`: Helper functions.

## Navigation
- `welcome`: Onboarding screen.
- `(auth)/login`: Login screen.
- `(auth)/register`: Sign up screen.
- `(tabs)/index`: Home discovery screen.
- `(tabs)/add`: Post new item screen.
- `(tabs)/profile`: User profile and posts.
- `item/[id]`: Detailed item view.
