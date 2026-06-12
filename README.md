# What Should I Play?

A privacy-first game recommendation site. Load a game library for the current browser session, answer a short mood and time quiz, and receive one explainable recommendation.

## Privacy

- No user accounts
- No database
- No local storage
- CSV and JSON files are processed in browser memory
- Closing or clearing the session removes the loaded library and answers

## Supported library paths

- Steam: planned ephemeral serverless connection
- Epic Games, EA app, GOG, Ubisoft Connect, and Battle.net: local CSV/JSON or Playnite export

The site is deployed with GitHub Pages from the `main` branch using GitHub Actions.
