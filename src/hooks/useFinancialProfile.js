import { useWorkspace } from './useWorkspace';
import { getProfileConfig } from '../lib/profiles/profileConfig';

export function useFinancialProfile() {
  const { profile } = useWorkspace();
  const profileId = profile?.financialProfile;
  return getProfileConfig(profileId);
}
