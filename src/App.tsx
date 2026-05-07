import { BrowserRouter } from 'react-router-dom';
import { AISettingsProvider } from '@/context/AISettingsContext';
import AppRoutes from '@/routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AISettingsProvider>
        <AppRoutes />
      </AISettingsProvider>
    </BrowserRouter>
  );
}
