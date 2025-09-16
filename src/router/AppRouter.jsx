import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Home from '../pages/Home';
import Movies from '../pages/Movies';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import MovieSearch from '../pages/MovieSearch';
import SearchHub from '../pages/SearchHub';
import NewsSearch from '../pages/NewsSearch';
import UserSearch from '../pages/UserSearch';
import ListsSearch from '../pages/ListsSearch';
import ReviewsSearch from '../pages/ReviewsSearch';
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
import EmailConfirmed from '../pages/EmailConfirmed';
import NewsPage from '../pages/NewsPage';
import MyNews from '../pages/MyNews';
import LikedNews from '../pages/LikedNews';
import ArticlePage from '../pages/ArticlePage';
import NewsCreatePage from '../pages/NewsCreatePage';
import NewsEditPage from '../pages/NewsEditPage';
import Lists from '../pages/Lists'
import ListDetails from '../pages/ListDetails'
import ListCreate from '../pages/ListCreate'
import LikedLists from '../pages/LikedLists'
import MyLists from '../pages/MyLists'
import UserLists from '../pages/UserLists'
import ActionLists from '../pages/ActionLists'
import UsersActionLists from '../pages/UsersActionLists'
import UserReviews from '../pages/UserReviews'
import MyReviews from '../pages/MyReviews'
import ReviewCreate from '../pages/ReviewCreate'
import ReviewEdit from '../pages/ReviewEdit'
import ReviewPage from '../pages/ReviewPage'
import AdminDashboard from '../pages/AdminDashboard'
import MovieMix from '../pages/MovieMix'
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
            <Route path="review/:reviewId" element={<ReviewPage />} />
            <Route path="reviews/my" element={
              <ProtectedRoute>
                <MyReviews />
              </ProtectedRoute>
            } />
            <Route path="reviews/:username" element={<UserReviews />} />
            <Route path="search" element={<SearchHub />} />
            <Route path="search/movies" element={<MovieSearch />} />
            <Route path="search/users" element={<UserSearch />} />
            <Route path="search/lists" element={<ListsSearch />} />
            <Route path="search/news" element={<NewsSearch />} />
            <Route path="search/reviews" element={<ReviewsSearch />} />
            <Route path="test-filter" element={<DynamicSearchFilterExample />} />
            <Route path="auth/callback" element={<AuthCallback />} />

            {/* News Routes */}
            <Route path="news" element={<NewsPage />} />
            <Route path="news/my" element={
              <ProtectedRoute>
                <MyNews />
              </ProtectedRoute>
            } />
            <Route path="news/liked" element={
              <ProtectedRoute>
                <LikedNews />
              </ProtectedRoute>
            } />
            <Route path="news/:id" element={<ArticlePage />} />

            <Route path="lists" element={<Lists />} />
            <Route path="lists/create" element={
              <ProtectedRoute>
                <ListCreate />
              </ProtectedRoute>
            } />
            <Route path="lists/liked" element={
              <ProtectedRoute>
                <LikedLists />
              </ProtectedRoute>
            } />
            <Route path="lists/my" element={
              <ProtectedRoute>
                <MyLists />
              </ProtectedRoute>
            } />
            <Route path="lists/:id" element={<ListDetails />} />
            <Route path="lists/:username" element={<UserLists />} />
            <Route path="action-lists/:type" element={
              <ProtectedRoute>
                <ActionLists />
              </ProtectedRoute>
            } />
            <Route path="users/:username/action-lists/:type" element={
              <ProtectedRoute>
                <UsersActionLists />
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

            {/* Protected Settings Route */}
            <Route 
                path="settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
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

          <Route 
              path="emailConfirmed" 
              element={<EmailConfirmed />} 
          />

          {/* Movie Mix Route (without main layout) */}
          <Route 
              path="movie-mix" 
              element={
                <ProtectedRoute>
                  <MovieMix />
                </ProtectedRoute>
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