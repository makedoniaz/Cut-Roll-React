import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Home from '../pages/Home';
import Movies from '../pages/Movies';
import Profile from '../pages/Profile';
import Search from '../pages/Search';
import NewsSearch from '../pages/NewsSearch';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminRoute from '../components/auth/AdminRoute';
import AuthInitializer from '../components/auth/AuthInitializer';
import AuthCallback from '../components/auth/AuthCallback';
import MovieDetails from '../pages/MovieDetails';
import RegistrationProtectedRoute from '../components/auth/RegistrationProtectedRoute'

import { useAuth } from '../hooks/useStores';
import ConfirmEmail from '../pages/ConfirmEmail';
import NewsPage from '../pages/NewsPage';
import ArticlePage from '../pages/ArticlePage';
import NewsCreatePage from '../pages/NewsCreatePage';
import NewsEditPage from '../pages/NewsEditPage';
import Lists from '../pages/Lists'
import ListDetails from '../pages/ListDetails'
import ListCreate from '../pages/ListCreate'
import ActionLists from '../pages/ActionLists'
import Reviews from '../pages/Reviews'
import ReviewCreate from '../pages/ReviewCreate'
import ReviewEdit from '../pages/ReviewEdit'
import AdminDashboard from '../pages/AdminDashboard'
import DynamicSearchFilterExample from '../components/examples/DynamicSearchFilterExample'

// Redirect component for authenticated users
const AuthRedirect = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthInitializer>
        <Routes>
          {/* Main Layout Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="movies" element={<Movies />} />
            <Route path="movie/:id" element={<MovieDetails />} />
            <Route path="movie/:id/review/create" element={
              <ProtectedRoute>
                <ReviewCreate />
              </ProtectedRoute>
            } />
            <Route path="movie/:id/review/edit/:reviewId" element={
              <ProtectedRoute>
                <ReviewEdit />
              </ProtectedRoute>
            } />
            <Route path="reviews" element={<Reviews />} />
            <Route path="search" element={<Search />} />
            <Route path="search/news" element={<NewsSearch />} />
            <Route path="test-filter" element={<DynamicSearchFilterExample />} />
            <Route path="auth/callback" element={<AuthCallback />} />

            {/* News Routes */}
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:id" element={<ArticlePage />} />

            <Route path="lists" element={<Lists />} />
            <Route path="lists/create" element={
              <ProtectedRoute>
                <ListCreate />
              </ProtectedRoute>
            } />
            <Route path="lists/:id" element={<ListDetails />} />
            <Route path="action-lists/:type" element={
              <ProtectedRoute>
                <ActionLists />
              </ProtectedRoute>
            } />

            
              <Route 
                path="news/create" 
                element={
                  <ProtectedRoute>
                    <NewsCreatePage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="news/edit/:id" 
                element={
                  <ProtectedRoute>
                    <NewsEditPage />
                  </ProtectedRoute>
                } 
              />
            
            
            {/* Protected Profile Route */}
            <Route 
                path="profile/:username" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />

            {/* Admin Dashboard Route */}
            <Route 
                path="admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
            </Route>
          
          <Route 
              path="confirm-email" 
              element={
                <RegistrationProtectedRoute>
                  <ConfirmEmail />
                </RegistrationProtectedRoute>
              } 
          />

          {/* Auth Routes (without main layout) */}
          <Route 
            path="/login" 
            element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            } 
          />
          <Route 
            path="/register" 
            element={
              <AuthRedirect>
                <Register />
              </AuthRedirect>
            } 
          />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthInitializer>
    </BrowserRouter>
  );
};

export default AppRouter;