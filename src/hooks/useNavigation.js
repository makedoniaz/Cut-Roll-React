import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';

export const useNavigation = () => {
  const navigate = useNavigate();

  const goToHome = () => navigate(ROUTES.HOME);
  const goToMovies = () => navigate(ROUTES.MOVIES);
  const goToMovie = (id) => navigate(`/movie/${id}`);
  const goToProfile = (username) => navigate(`/profile/${username}`);
  const goToLists = () => navigate(ROUTES.LISTS);
  const goToReviews = () => navigate(ROUTES.REVIEWS);
  const goToSearch = (query) => navigate(`${ROUTES.SEARCH}?q=${query}`);
  const goToNewsSearch = (query, filters = null) => {
    if (filters) {
      navigate(ROUTES.NEWS_SEARCH, { state: { prefillFilters: filters } });
    } else {
      navigate(`${ROUTES.NEWS_SEARCH}?q=${query}`);
    }
  };
  const goToLogin = () => navigate(ROUTES.LOGIN);
  const goToRegister = () => navigate(ROUTES.REGISTER);
  const goBack = () => navigate(-1);
  const goForward = () => navigate(1);

  return {
    goToHome,
    goToMovies,
    goToMovie,
    goToProfile,
    goToLists,
    goToReviews,
    goToSearch,
    goToNewsSearch,
    goToLogin,
    goToRegister,
    goBack,
    goForward,
    navigate, // For custom navigation
  };
};