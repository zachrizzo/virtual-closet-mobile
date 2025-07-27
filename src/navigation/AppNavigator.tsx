import React from 'react';
import { useAppSelector } from '@/store';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

const AppNavigator = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return isAuthenticated ? <TabNavigator /> : <AuthNavigator />;
};

export default AppNavigator;