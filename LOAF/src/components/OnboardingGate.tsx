import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useOnboarding } from '../hooks/useOnboarding';

const COLORS = {
  background: '#000000',
  secondary: '#B5BFA1',
};

interface OnboardingGateProps {
  children: React.ReactNode;
}

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { isLoading, needsOnboarding, completeOnboarding } = useOnboarding();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  if (needsOnboarding) {
    return (
      <OnboardingScreen
        onComplete={async (data) => {
          await completeOnboarding({
            age: data.age,
            height: data.height,
            weight: data.weight,
            dietType: data.dietType,
          });
        }}
      />
    );
  }

  return <>{children}</>;
}
