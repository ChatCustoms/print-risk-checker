import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout.tsx';
import { Home } from './pages/Home.tsx';
import { ModelInput } from './pages/ModelInput.tsx';
import { PrinterMaterial } from './pages/PrinterMaterial.tsx';
import { Results } from './pages/Results.tsx';
import { ReportDetails } from './pages/ReportDetails.tsx';
import { History } from './pages/History.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="assess/model" element={<ModelInput />} />
          <Route path="assess/printer" element={<PrinterMaterial />} />
          <Route path="results/:id" element={<Results />} />
          <Route path="report/:id" element={<ReportDetails />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
