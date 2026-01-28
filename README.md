# 🖨️ Print Risk Checker

A professional 3D printing pre-flight assessment tool that analyzes print risks and generates comprehensive print plans. Built with React + TypeScript + Tailwind CSS.

## 🎯 What It Does

Print Risk Checker helps 3D printing enthusiasts avoid failed prints by:

1. **Risk Assessment** - Scores printability risk (Low / Medium / High) based on model geometry, material, and printer settings
2. **Detailed Explanation** - Provides clear, specific reasons for the risk rating
3. **Print Plan Generation** - Recommends optimal settings (orientation, supports, speeds, etc.)
4. **Professional Reports** - Creates downloadable print plans (PDF & Markdown)
5. **History Tracking** - Saves assessments locally for future reference

## ✨ Features

### Core Functionality
- 📊 **Rule-based Risk Scoring** - Comprehensive analysis of geometry, material, and settings
- 🎯 **Confidence Levels** - Indicates assessment accuracy based on provided information
- 📋 **Pre-Flight Checklist** - Action items to verify before printing
- 💾 **Local Storage** - No backend required, data stored in browser
- 📄 **Dual Export Formats** - Download as Markdown or PDF

### Assessment Categories
- **Geometry Risks**: Tall/unstable parts, thin walls, overhangs, bridges
- **Material Compatibility**: Use-case vs. material properties
- **Printer Settings**: Speed, supports, adhesion methods
- **Custom Recommendations**: Material-specific notes and warnings

### Pages
- **Home** - Landing page with feature overview
- **Model Input** - Detailed form for model specifications
- **Printer Setup** - Printer and material configuration
- **Results** - Comprehensive risk assessment and print plan
- **History** - List of all saved assessments
- **Report Details** - Full view of individual assessments

## 🚀 Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **File Export**: file-saver
- **State Management**: React hooks + SessionStorage/LocalStorage

## 📁 Project Structure

```
print-risk-checker/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.tsx
│   │   ├── RiskBadge.tsx
│   │   ├── ProgressStepper.tsx
│   │   ├── ConfidenceMeter.tsx
│   │   └── PrintPlanCard.tsx
│   ├── pages/            # Route pages
│   │   ├── Home.tsx
│   │   ├── ModelInput.tsx
│   │   ├── PrinterMaterial.tsx
│   │   ├── Results.tsx
│   │   ├── ReportDetails.tsx
│   │   └── History.tsx
│   ├── services/         # Business logic
│   │   ├── riskAssessment.ts
│   │   ├── printPlanGenerator.ts
│   │   ├── reportGenerator.ts
│   │   └── storage.ts
│   ├── types/            # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/            # Constants and helpers
│   │   └── constants.ts
│   ├── App.tsx           # Router configuration
│   ├── main.tsx          # Entry point
│   └── index.css         # Tailwind imports
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📖 How to Use

### Step 1: Enter Model Details
- Provide model name and dimensions (X, Y, Z)
- Specify intended use (decorative, functional, fit-critical)
- Add optional details: wall thickness, overhangs, bridges, etc.

### Step 2: Configure Printer & Material
- Select material (PLA, PETG, ABS, etc.)
- Set nozzle size and layer height
- Choose bed size preset or enter manually
- Enable/disable supports
- Select print priority (quality, strength, speed)

### Step 3: Review Results
- View overall risk level (Low/Medium/High)
- Read specific risk factors with mitigation strategies
- Review recommended print plan
- Complete pre-flight checklist
- Download report (Markdown or PDF)
- Save to history for later reference

## 🧠 Risk Assessment Logic

The tool evaluates risks across multiple dimensions:

### Geometry Analysis
- **Aspect Ratio**: Tall parts with small footprints → wobble risk
- **Wall Thickness**: Thin walls relative to nozzle size → printability issues
- **Base Stability**: Parts without flat bases → adhesion problems
- **Size vs. Bed**: Model exceeds printer capacity
- **Overhangs & Bridges**: Support requirements

### Material Compatibility
- **Use Case Matching**: Functional parts need strong materials
- **Heat Resistance**: PLA unsuitable for high-temp applications
- **Flexibility**: TPU not suitable for rigid parts
- **Warping**: ABS/Nylon require special handling

### Settings Optimization
- **Speed vs. Quality**: Fast speeds reduce dimensional accuracy
- **Layer Height**: Too thick for small features
- **Adhesion Method**: Brim/raft recommendations
- **Support Configuration**: Based on geometry and material

## 🎨 Key Components

### RiskBadge
Color-coded badge displaying risk level (green/yellow/red)

### ConfidenceMeter
Visual indicator of assessment confidence based on unknown fields

### ProgressStepper
3-step progress indicator for assessment flow

### PrintPlanCard
Reusable card component for displaying print plan sections

## 📊 Data Storage

- **SessionStorage**: Temporary storage during assessment flow
- **LocalStorage**: Persistent storage for saved assessments
- **Export Options**: Markdown text files and PDF documents

No backend required - all data stays in the browser.

## 🔮 Future Enhancements

- [ ] Cloud sync for cross-device access
- [ ] G-code analysis integration
- [ ] STL file upload and automatic dimension detection
- [ ] Machine learning for improved risk prediction
- [ ] Community-contributed print profiles
- [ ] Integration with popular slicers (Cura, PrusaSlicer)
- [ ] Mobile app version
- [ ] Multi-language support

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning or inspiration.

## 🙏 Acknowledgments

- Built with inspiration from the 3D printing community
- Material properties based on common filament specifications
- Risk assessment logic derived from best practices in FDM printing

---

**Built by Stephano Chatham** - Portfolio Project

Made with ❤️ for the 3D printing community
