# LOST_DIR Client

The mobile client for the Lost & Found application, built with Expo and TypeScript.

## Key Features
- **Lost & Found Feed**: Browse items with advanced filtering (Category, Date, Location).
- **Interactive Map**: View item locations (Coming Soon).
- **Trust & Safety**: 
  - **Police Loss Reports**: Upload and securely store official loss reports (RB).
  - **Smart Claims**: Claim found items by verifying against your stored loss reports.
  - **Confidence Scoring**: Automatic matching algorithm to assist owners and finders.
- **Multilingual**: Full support for English and Kiswahili.

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
- `app/`:
  - `(tabs)/`: Main tab navigation (Home, Profile, Add).
  - `loss-report/`: Screens for managing Police Loss Reports.
  - `claims/`: Screens for managing item claims.
  - `claim/`: Flow for creating a new claim.
  - `item/`: Detailed item view.
- `components/`: Reusable UI components (TrustGuidance, Skeleton, Themed components).
- `context/`: Authentication and global state.
- `services/`: API communication layers (Item, Trust, Auth).
- `i18n/`: Localization files (en, sw).

## Navigation Flows
- **Discovery**: Home -> Item Details -> Claim (if item is found).
- **Reporting**: Profile -> Police Reports -> New Report.
- **Recovery**: Profile -> Claims -> View Claim Status -> Chat/Return.
