import { BrowserRouter } from 'react-router-dom';

import { AppProviders } from './app/AppProviders';
import { AppRoutes } from './app/routes';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
