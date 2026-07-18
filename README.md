<table>
  <thead>
    <tr>
      <th style="text-align:center"><a href="README_ja.md">日本語</a></th>
      <th style="text-align:center"><a href="README.md">English</a></th>
    </tr>
  </thead>
</table>

# Imperial Succession Lineage

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.13.0-339933?logo=node.js&logoColor=white)](package.json)

An interactive Japanese-language visualization of the imperial lineage from Emperor Jimmu to the current 126th emperor. It presents the main succession line alongside Northern Court branches, intermediary princes and royal descendants, and the eleven former imperial houses that left the Imperial Family in 1947.

## Preview

<a href="https://imperial-succession.sm-macm4.chatgpt.site/">
  <img src="githubreadme/imperial-succession-preview.jpeg" alt="Interactive Imperial Succession Lineage website" width="480">
</a>

[Open the live site](https://imperial-succession.sm-macm4.chatgpt.site/)

## Features

- Explore all 126 emperors from the traditional first emperor to the present emperor.
- Follow the five-emperor Northern Court branch and the reunification of the Southern and Northern Courts.
- Reveal the lineage of the eleven former imperial houses and their 1947 departure from imperial status.
- Search emperors, princes, royal descendants, and former imperial houses by name or reading.
- Jump between historical periods, pan across the lineage, and adjust the zoom level.
- Open profile cards with reign dates, lineage connections, readings, and historical notes.
- Distinguish female emperors and non-emperor lineage nodes through dedicated visual treatments.
- Use the responsive interface on desktop and mobile layouts with keyboard and screen-reader labels.

## Data Source

The core parent-child relationships and intermediary royal figures are based on the Imperial Household Agency's [Genealogy of the Emperors](https://www.kunaicho.go.jp/learn/about/kosei/keizu.html). Some intermediate heads of the former imperial houses are intentionally omitted to keep the visualization readable.

## Tech Stack

- Next.js and React
- TypeScript
- Vinext and Vite
- Cloudflare Workers-compatible runtime
- Plain CSS for the visualization and responsive interface

## Requirements

- Node.js 22.13.0 or later
- npm

The production build and test scripts use Linux utilities including GNU `timeout`. Local development with the Vite server does not require those scripts.

## Installation

```bash
git clone https://github.com/Shuichi346/imperial-succession.git
cd imperial-succession
npm ci
```

## Usage

Start the local development server:

```bash
npm run dev
```

Then open the local URL printed in the terminal.

No environment variables or database configuration are required for the current read-only visualization.

## Development

```bash
npm run lint
npm run build
npm test
```

- `npm run lint` checks the TypeScript and React source with ESLint.
- `npm run build` creates and validates the deployable worker artifact.
- `npm test` builds the site and verifies its rendered HTML metadata.

## Security Note

The current development toolchain resolves `ws@8.18.0`, which is covered by known WebSocket resource-exhaustion advisories, while the Vite development server is configured to listen on all network interfaces. This affects only a developer running `npm run dev` on a network reachable by untrusted peers; it does not affect the deployed public Worker or expose account credentials. Updating the Vite dependency chain and defaulting the development server to a loopback-only listener are recommended but intentionally deferred.

## Project Structure

```text
app/
  page.tsx            Interactive lineage interface
  emperors.ts         Emperor records and era navigation
  royal-lineage.ts    Intermediary royal lineage records
  former-houses.ts    Former imperial house records
  globals.css         Visualization and responsive styles
public/               Static assets
tests/                Rendered HTML test
worker/               Cloudflare-compatible worker entry point
```

## License

This project is licensed under the [MIT License](LICENSE).
