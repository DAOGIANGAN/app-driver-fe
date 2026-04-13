// NavigationService.ts
import { createNavigationContainerRef, NavigationContainerRef } from '@react-navigation/native';
import { ParamListBase } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<ParamListBase>();

export function navigate(name: keyof ParamListBase, params?: Record<string, any>) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
