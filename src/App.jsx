import { BrowserRouter } from 'react-router-dom';

import { AppProviders } from './app/AppProviders';
import { AppRoutes } from './app/routes';

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
