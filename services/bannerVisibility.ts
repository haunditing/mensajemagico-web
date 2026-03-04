type VisibilityContext = {
  user: any;
  isLoading?: boolean;
  pathname: string;
  hasSeenOnboarding?: boolean;
  trialWelcomeDismissed?: boolean;
  trialBannerDismissed?: boolean;
  offerBannerDismissed?: boolean;
  isOfferActive?: boolean;
};

const isGuestUser = (user: any) => !user;
const isPremiumUser = (user: any) => user?.planLevel === "premium";
const hasActiveTrial = (user: any) => user?.trial?.active === true;

export const shouldShowTrialOnboardingModal = ({
  user,
  pathname,
  hasSeenOnboarding,
}: VisibilityContext): boolean => {
  if (!isGuestUser(user)) return false;
  if (pathname !== "/") return false;
  return !hasSeenOnboarding;
};

export const shouldShowTrialWelcomeBanner = ({
  user,
  pathname,
  hasSeenOnboarding,
  trialWelcomeDismissed,
}: VisibilityContext): boolean => {
  if (!isGuestUser(user)) return false;
  if (trialWelcomeDismissed) return false;
  if (pathname === "/" && !hasSeenOnboarding) return false;
  return true;
};

export const shouldShowTrialBanner = ({
  user,
  pathname,
  isLoading,
  trialBannerDismissed,
}: VisibilityContext): boolean => {
  if (isLoading) return false;
  if (isPremiumUser(user)) return false;
  if (!hasActiveTrial(user)) return false;
  if (pathname === "/pricing") return false;
  if (trialBannerDismissed) return false;
  return true;
};

export const shouldShowOfferBanner = ({
  user,
  pathname,
  isLoading,
  isOfferActive,
  offerBannerDismissed,
}: VisibilityContext): boolean => {
  if (isLoading) return false;
  if (isGuestUser(user)) return false;
  if (isPremiumUser(user)) return false;
  if (!isOfferActive) return false;
  if (offerBannerDismissed) return false;
  if (pathname === "/pricing") return false;
  if (hasActiveTrial(user)) return false;
  return true;
};
