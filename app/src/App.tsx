import { MotionConfig } from 'motion/react';
import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { ThemeSync } from './components/ThemeSync';
import { ChatRedirect } from './features/chat/ChatRedirect';
import { SearchProvider } from './features/search/SearchProvider';
import HomePage from './routes/HomePage';
import NotFoundPage from './routes/NotFoundPage';

const ArticlePage = lazy(() => import('./features/wiki/ArticlePage'));
const CategoryPage = lazy(() => import('./features/wiki/CategoryPage'));
const IndexPage = lazy(() => import('./features/wiki/IndexPage'));
const SearchPage = lazy(() => import('./features/search/SearchPage'));
const SettingsPage = lazy(() => import('./routes/SettingsPage'));
const AboutPage = lazy(() => import('./routes/AboutPage'));

/** BrowserRouter の basename（末尾スラッシュなし） */
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="wiki/:category" element={<CategoryPage />} />
        <Route path="wiki/:category/:slug" element={<ArticlePage />} />
        <Route path="index" element={<IndexPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="chat" element={<ChatRedirect />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <MotionConfig reducedMotion="user">
        <ThemeSync />
        <SearchProvider>
          <AppRoutes />
        </SearchProvider>
      </MotionConfig>
    </BrowserRouter>
  );
}
