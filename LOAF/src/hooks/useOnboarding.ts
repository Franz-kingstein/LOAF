import { useState, useEffect } from 'react';
import {
  createUserProfile,
  getUserProfile,
  type UserProfile,
} from '../index';

export function useOnboarding() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  async function checkOnboardingStatus() {
    try {
      const profile = await getUserProfile();
      if (profile) {
        setUserProfile(profile);
        setNeedsOnboarding(false);
      } else {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setNeedsOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function completeOnboarding(data: {
    age?: string;
    height?: string;
    weight?: string;
    dietType?: string;
  }) {
    try {
      const profile = await createUserProfile({
        age: data.age ? parseInt(data.age, 10) : 0,
        gender: 'Not specified',
        height_cm: data.height ? parseFloat(data.height) : 0,
        weight_kg: data.weight ? parseFloat(data.weight) : 0,
        diet_type: data.dietType || 'Not specified',
        active_goals: [],
      });
      setUserProfile(profile);
      setNeedsOnboarding(false);
      return profile;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  return {
    userProfile,
    isLoading,
    needsOnboarding,
    completeOnboarding,
  };
}
