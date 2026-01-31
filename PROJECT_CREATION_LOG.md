# Print Risk Checker - Complete Project Creation Log

**Date:** January 28, 2026  
**GitHub Repository:** https://github.com/ChatCustoms/print-risk-checker  
**Developer:** Stephano Chatham  
**Dev Server:** http://localhost:5173/

---

## Project Overview

Created a comprehensive 3D printing pre-flight assessment tool that analyzes print risks and generates detailed print plans. Built with React + TypeScript + Vite + Tailwind CSS.

### Tech Stack
- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS v3
- **PDF Generation:** jsPDF
- **File Export:** file-saver
- **Storage:** LocalStorage (no backend required)

---

## Installation & Setup Process

### 1. Initial Setup
```bash
# Install Homebrew (was needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"

# Install Node.js
brew install node
```

### 2. Project Creation
```bash
# Create Vite project
npm create vite@latest print-risk-checker -- --template react-ts

# Install dependencies
cd print-risk-checker
npm install

# Install additional packages
npm install react-router-dom jspdf file-saver
npm install -D tailwindcss@^3.4.0 postcss autoprefixer @types/file-saver
```

### 3. Configuration
- Created `tailwind.config.js` with custom risk colors
- Created `postcss.config.js`
- Updated `src/index.css` with Tailwind directives
- Fixed TypeScript imports to use `import type` for type-only imports (required by `erasableSyntaxOnly: true`)

---

## Project Structure

```
print-risk-checker/
├── src/
│   ├── components/
│   │   ├── Layout.tsx              # Main layout with nav
│   │   ├── RiskBadge.tsx           # Color-coded risk indicator
│   │   ├── ProgressStepper.tsx     # 3-step progress indicator
│   │   ├── ConfidenceMeter.tsx     # Confidence level visual
│   │   └── PrintPlanCard.tsx       # Reusable card component
│   ├── pages/
│   │   ├── Home.tsx                # Landing page
│   │   ├── ModelInput.tsx          # Step 1: Model details
│   │   ├── PrinterMaterial.tsx     # Step 2: Printer settings
│   │   ├── Results.tsx             # Step 3: Risk + plan display
│   │   ├── ReportDetails.tsx       # Saved assessment viewer
│   │   └── History.tsx             # Saved assessments list
│   ├── services/
│   │   ├── riskAssessment.ts       # Rule-based risk scoring
│   │   ├── printPlanGenerator.ts   # Print plan recommendations
│   │   ├── reportGenerator.ts      # Markdown + PDF export
│   │   └── storage.ts              # LocalStorage wrapper
│   ├── types/
│   │   └── index.ts                # All TypeScript interfaces
│   ├── utils/
│   │   └── constants.ts            # Material properties, thresholds
│   ├── App.tsx                     # Router configuration
│   └── main.tsx                    # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── .gitignore
└── README.md
```

---

## Risk Assessment Engine - Detailed Rule Set

### Risk Scoring System
- **0-19 points** = LOW risk
- **20-39 points** = MEDIUM risk  
- **40+ points** = HIGH risk

### Confidence Levels
- **0-1 unknowns** = High confidence
- **2-3 unknowns** = Medium confidence
- **4+ unknowns** = Low confidence

### Derived Values (Computed)
```typescript
footprint_mm2 = x_mm * y_mm
slenderness = z_mm / max(x_mm, y_mm)
base_ratio = min(x_mm, y_mm) / max(x_mm, y_mm)
unknown_count = count of "unknown" inputs
```

---

## Rule Groups (Implemented)

### A) Print Stability & Tall-Part Risk

**A1 - Tall/slender part**
- If `slenderness > 3.0` → +18 points (HIGH)
- If `slenderness > 2.0` → +10 points (MEDIUM)
- *Reason:* Tall parts can wobble, lose adhesion, or shift layers
- *Mitigation:* Add brim, slow down, increase cooling, re-orient, or split model

**A2 - Small footprint relative to height**
- If `z_mm >= 180 AND footprint_mm2 < 2500` → +16 points
- If `z_mm >= 120 AND footprint_mm2 < 2500` → +10 points
- *Reason:* High center of mass + small base increases failure
- *Mitigation:* Brim/raft, supports as stabilizers, split model

**A3 - Flat base unknown**
- If `flat_base == unknown` → +4 points
- *Reason:* Base geometry is critical to first-layer success
- *Mitigation:* Confirm base area; consider adding brim

---

### B) Walls, Features, and Nozzle Compatibility

**B1 - Minimum wall thickness vs nozzle**
- If `min_wall_mm < (2 × nozzle_mm)` → +18 points (HIGH)
- Else if `min_wall_mm < (3 × nozzle_mm)` → +10 points
- If `min_wall_mm == unknown` → +6 points
- *Reason:* Walls thinner than 2-3 extrusion widths often fail or become fragile
- *Mitigation:* Increase wall thickness in CAD, use smaller nozzle, increase perimeters

**B2 - Minimum feature size vs nozzle**
- If `min_feature_mm < (1.2 × nozzle_mm)` → +14 points
- Else if `min_feature_mm < (2.0 × nozzle_mm)` → +8 points
- If `min_feature_mm == unknown` → +4 points
- *Reason:* Tiny features may not resolve cleanly at typical nozzle widths
- *Mitigation:* Scale model up, switch to smaller nozzle, increase line width control

---

### C) Overhangs & Supports Logic

**C1 - Overhangs present**
- If `overhangs == many` → +16 points
- If `overhangs == some` → +8 points
- If `overhangs == unknown` → +5 points

**C2 - Supports disabled but overhangs exist**
- If `supports_allowed == no AND overhangs in {some, many}` → +18 points (HIGH)
- *Reason:* Unsupported overhangs are one of the top failure modes
- *Mitigation:* Allow supports, re-orient, split model

---

### D) Bridges

**D1 - Bridges expected**
- If `bridges == many` → +12 points
- If `bridges == some` → +6 points
- If `bridges == unknown` → +4 points
- *Reason:* Bridges require tuning (cooling/speed) and can sag
- *Mitigation:* Increase cooling, reduce bridge speed, add supports

---

### E) Size & Fit Constraints

**E1 - Bed fit**
- If model exceeds bed dimensions → +30 points (CRITICAL)
- *Reason:* Cannot print in one piece
- *Mitigation:* Split model, rotate, scale, or print diagonally

**E2 - Very large part**
- If `max(x_mm, y_mm) >= 220 OR z_mm >= 220` → +10 points
- *Reason:* Long prints amplify warp, drift, and adhesion issues
- *Mitigation:* Brim, enclosure (for ABS/Nylon), segment model

---

### F) Intended Use

**F1 - Functional**
- If `fit_critical == functional` → +6 points
- *Reason:* Functional parts need stronger walls/infill and tougher material choices
- *Mitigation:* More perimeters, higher infill, consider PETG/ABS/Nylon

**F2 - Fit-critical**
- If `fit_critical == fit-critical` → +14 points
- *Reason:* Tolerances, shrinkage, and dimensional error matter
- *Mitigation:* Calibration, test coupon, adjust XY compensation, print slower

---

### G) Material-Specific Risk Adjustments

**G1 - PLA / PLA+**
- If functional → +3 points (softening/creep risk)
- If fit-critical → +2 points (dimension ok, but can creep under load)

**G2 - PETG**
- If overhangs in {some, many} → +3 points (stringing + droop)
- If bridges in {some, many} → +2 points

**G3 - ABS**
- Baseline → +8 points (warp/shrink risk)
- If flat_base == no → +4 points additional

**G4 - Nylon**
- Baseline → +10 points (moisture + warp)
- If fit-critical → +4 points (shrink variability)

**G5 - TPU**
- Baseline → +10 points (speed + extrusion control)
- If min_feature < 2.0mm → +6 points

---

## Print Plan Recommendations (Rule-Based)

### Perimeters (Walls)
- **Decorative** → 2-3 walls
- **Functional** → 4 walls
- **Fit-critical** → 4 walls + slow outer walls

### Infill
- **Decorative** → 10-15% (grid)
- **Functional** → 25-40% (gyroid)
- **Fit-critical** → 20-30% (cubic, focus on calibration)

### Adhesion
- If stability rule triggered (A1/A2) OR ABS/Nylon → recommend brim
- If very large (E2) and material is ABS/Nylon → recommend enclosure

### Supports
- If overhangs some/many and supports allowed → "Supports ON (touching build plate)"
- If fit-critical → "Use supports only where needed; avoid critical surfaces"

### Speed Guidance
- If High risk: "Reduce speed 20-30%, prioritize stability"
- If fit-critical: "Slow outer walls; consider calibration pass"

---

## Issues Fixed During Development

### 1. Tailwind CSS v4 Compatibility Issue
**Problem:** Tailwind v4 requires different PostCSS plugin  
**Solution:** Downgraded to Tailwind CSS v3.4.0 for compatibility

### 2. TypeScript Module Import Errors
**Problem:** `The requested module does not provide an export named 'Assessment'`  
**Cause:** TypeScript config has `erasableSyntaxOnly: true` and `verbatimModuleSyntax: true`  
**Solution:** Changed all type-only imports to use `import type { ... }`

Example:
```typescript
// Before
import { Assessment } from '../types/index.ts';

// After
import type { Assessment } from '../types/index.ts';
```

Applied to all files:
- All service files (`*.ts`)
- All page components (`*.tsx`)
- All components (`*.tsx`)

---

## Git & GitHub Setup

### Initial Commit
```bash
cd print-risk-checker
git init
git add .
git commit -m "Initial commit: 3D Print Risk Checker..."
```

### Connect to GitHub
```bash
git remote add origin https://github.com/ChatCustoms/print-risk-checker.git
git push -u origin main
```

### Repository
https://github.com/ChatCustoms/print-risk-checker

---

## Running the Application

### Development Server
```bash
cd /Users/stephanochatham/print-risk-checker
eval "$(/opt/homebrew/bin/brew shellenv)"
npm run dev
```
Opens at: http://localhost:5173/

### Build for Production
```bash
npm run build
```
Output in `dist/` folder

### Preview Production Build
```bash
npm run preview
```

---

## Key Features Implemented

### 1. Risk Assessment Flow
- **Step 1:** Model input form (dimensions, geometry, use-case)
- **Step 2:** Printer/material configuration
- **Step 3:** Comprehensive results with risk scoring

### 2. Smart Risk Analysis
- Geometry risks (tall/unstable, thin walls, overhangs)
- Material compatibility checks  
- Settings optimization recommendations
- Confidence scoring based on data completeness

### 3. Professional Reports
- Downloadable Markdown reports
- PDF export with jsPDF
- Pre-flight checklist
- Material-specific notes

### 4. History Management
- Save assessments to browser LocalStorage
- View past assessments
- Delete unwanted entries
- No backend required

---

## File Locations

### Critical Files
- Risk Assessment: `src/services/riskAssessment.ts`
- Print Plan Generator: `src/services/printPlanGenerator.ts`
- Report Generator: `src/services/reportGenerator.ts`
- Storage Service: `src/services/storage.ts`
- Type Definitions: `src/types/index.ts`
- Constants: `src/utils/constants.ts`

### Configuration
- Tailwind: `tailwind.config.js`
- PostCSS: `postcss.config.js`
- TypeScript: `tsconfig.json`, `tsconfig.app.json`
- Vite: `vite.config.ts`

---

## Next Steps / Future Enhancements

1. **Deploy to Vercel/Netlify**
   - Connect GitHub repo
   - Auto-deploys on every push
   - Get live URL for portfolio

2. **Add Screenshots**
   - Take screenshots of the app
   - Add to README.md
   - Makes portfolio more impressive

3. **Additional Features (Future)**
   - [ ] STL file upload with automatic dimension detection
   - [ ] Cloud sync for cross-device access
   - [ ] More printer presets
   - [ ] G-code analyzer integration
   - [ ] Community-contributed print profiles

4. **Update README**
   - Add your contact information
   - Add project screenshots
   - Add live demo link (after deployment)

---

## Useful Commands

```bash
# Navigate to project
cd /Users/stephanochatham/print-risk-checker

# Start dev server
npm run dev

# Build for production
npm run build

# Git status
git status

# Stage changes
git add -A

# Commit changes
git commit -m "Your message here"

# Push to GitHub
git push origin main

# Stop background dev server (if needed)
# Find process: ps aux | grep vite
# Kill process: kill <PID>
```

---

## Environment Setup Reminder

Always load Homebrew into PATH before running npm commands:
```bash
eval "$(/opt/homebrew/bin/brew shellenv)"
```

Or ensure it's in your `~/.zshrc`:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
```

---

## Portfolio Value

This project demonstrates:
- ✅ Modern stack: React 18, TypeScript, Vite, Tailwind
- ✅ Complex logic: Rule-based risk assessment system
- ✅ UX design: Multi-step forms, progress indicators, confidence meters
- ✅ File operations: PDF generation, Markdown export
- ✅ State management: SessionStorage/LocalStorage
- ✅ Production-ready: Type-safe, organized architecture, comprehensive README

---

**End of Project Creation Log**  
*Generated: January 28, 2026*  
*Built with Claude Sonnet 4.5*
