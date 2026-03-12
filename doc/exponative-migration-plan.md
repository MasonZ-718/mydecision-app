╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 React Native Migration Plan: MyDecision V3

 Web App → Expo iOS-First Mobile App

 ---
 Overview

 Goal: Migrate MyDecision V3 from React web (Vite + React Router + Tailwind CDN) to React Native using Expo   
 with iOS-first design principles.

 Technology Stack:
 - Framework: Expo (managed workflow)
 - Platform: iOS only
 - Styling: NativeWind (Tailwind for React Native)
 - Navigation: Expo Router (file-based routing)
 - Animations: Reanimated + Moti
 - Storage: AsyncStorage

 Complexity: HIGH (due to physics simulation, complex state, and extensive UI)

 ---
 Phase 1: Foundation Setup

 1.1 Initialize Expo Project

 npx create-expo-app@latest MyDecision_RN --template blank-typescript
 cd MyDecision_RN

 1.2 Install Core Dependencies

 # Navigation (Expo Router)
 npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants 
  expo-status-bar

 # Storage
 npx expo install @react-native-async-storage/async-storage

 # Styling
 npm install nativewind
 npm install --save-dev tailwindcss@3.3.2

 # Animations
 npx expo install react-native-reanimated react-native-gesture-handler
 npm install moti

 # Device Features
 npx expo install expo-haptics expo-blur
 npm install react-native-uuid

 # Forms
 npx expo install @react-native-community/datetimepicker

 # Icons
 npx expo install react-native-svg @expo/vector-icons

 1.3 Configure NativeWind

 tailwind.config.js:
 module.exports = {
   content: [
     "./app/**/*.{js,jsx,ts,tsx}",
     "./components/**/*.{js,jsx,ts,tsx}"
   ],
   theme: {
     extend: {
       colors: {
         zinc: {
           800: '#27272a',
           900: '#18181b',
           950: '#09090b',
         },
       },
     },
   },
 };

 babel.config.js:
 module.exports = function(api) {
   api.cache(true);
   return {
     presets: ['babel-preset-expo'],
     plugins: [
       'nativewind/babel',
       'react-native-reanimated/plugin', // Must be last
     ],
   };
 };

 1.4 Project Structure

 MyDecision_RN/
 ├── app/
 │   ├── _layout.tsx              # Root layout with providers
 │   ├── index.tsx                # Home
 │   ├── dashboard.tsx            # Dashboard
 │   ├── new.tsx                  # Create decision
 │   ├── decision/[id].tsx        # Decision detail
 │   ├── doubt-selection.tsx
 │   └── settings.tsx
 ├── components/
 │   ├── ui/
 │   │   ├── Button.tsx
 │   │   ├── AuroraBackground.tsx
 │   │   └── SafeContainer.tsx
 │   ├── decision/
 │   │   ├── DecisionBubbleView.tsx  # COMPLEX
 │   │   ├── DecisionCardModal.tsx
 │   │   └── DecisionListItem.tsx
 │   └── premium/
 ├── context/
 │   └── StoreContext.tsx
 ├── hooks/
 │   ├── usePhysics.ts           # Physics simulation
 │   └── useHaptics.ts
 ├── types/
 │   └── index.ts
 ├── constants/
 │   └── index.ts
 └── utils/
     └── storage.ts

 ---
 Phase 2: State Management Migration

 2.1 Migrate StoreContext (CRITICAL)

 File: context/StoreContext.tsx
 From: D:\developments\MyDecision_V3\context\StoreContext.tsx

 Key Changes:

 1. Replace localStorage with AsyncStorage:
 // Before: Synchronous
 const saved = localStorage.getItem(STORAGE_KEY);
 localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

 // After: Asynchronous
 const saved = await AsyncStorage.getItem(STORAGE_KEY);
 await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
 2. Add loading state:
 const [isLoading, setIsLoading] = useState(true);
 const [isHydrated, setIsHydrated] = useState(false);

 useEffect(() => {
   const loadData = async () => {
     try {
       const saved = await AsyncStorage.getItem(STORAGE_KEY);
       if (saved) setState(JSON.parse(saved));
     } catch (e) {
       console.error('Load failed', e);
     } finally {
       setIsLoading(false);
       setIsHydrated(true);
     }
   };
   loadData();
 }, []);
 3. Debounced save:
 useEffect(() => {
   if (!isHydrated) return;

   const saveData = async () => {
     try {
       await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
     } catch (e) {
       console.error('Save failed', e);
     }
   };

   const timeoutId = setTimeout(saveData, 500);
   return () => clearTimeout(timeoutId);
 }, [state, isHydrated]);
 4. Loading UI:
 if (isLoading) {
   return (
     <View className="flex-1 items-center justify-center bg-black">
       <ActivityIndicator size="large" color="#ffffff" />
     </View>
   );
 }

 ---
 Phase 3: Navigation Migration

 3.1 Root Layout

 File: app/_layout.tsx

 import { Slot } from 'expo-router';
 import { StoreProvider } from '../context/StoreContext';
 import { GestureHandlerRootView } from 'react-native-gesture-handler';
 import { SafeAreaProvider } from 'react-native-safe-area-context';

 export default function RootLayout() {
   return (
     <SafeAreaProvider>
       <GestureHandlerRootView style={{ flex: 1 }}>
         <StoreProvider>
           <Slot />
         </StoreProvider>
       </GestureHandlerRootView>
     </SafeAreaProvider>
   );
 }

 3.2 Navigation API Changes

 Replace React Router with Expo Router:
 ┌───────────────────────┬────────────────────────┐
 │ Before (React Router) │  After (Expo Router)   │
 ├───────────────────────┼────────────────────────┤
 │ useNavigate()         │ useRouter()            │
 ├───────────────────────┼────────────────────────┤
 │ navigate('/path')     │ router.push('/path')   │
 ├───────────────────────┼────────────────────────┤
 │ useParams()           │ useLocalSearchParams() │
 ├───────────────────────┼────────────────────────┤
 │ useSearchParams()     │ useLocalSearchParams() │
 ├───────────────────────┼────────────────────────┤
 │ <Link to="/path">     │ <Link href="/path">    │
 └───────────────────────┴────────────────────────┘
 ---
 Phase 4: Core Components

 4.1 Button Component

 File: components/ui/Button.tsx
 From: D:\developments\MyDecision_V3\components\Button.tsx

 Changes:
 - Replace <button> with <Pressable>
 - Replace ButtonHTMLAttributes with PressableProps
 - Add loading state with ActivityIndicator

 import { Pressable, Text, ActivityIndicator } from 'react-native';

 <Pressable
   className={cn(baseStyles, variants[variant], className)}
   disabled={disabled || loading}
   {...props}
 >
   {loading ? <ActivityIndicator /> : <Text>{children}</Text>}
 </Pressable>

 4.2 SafeContainer (New Component)

 File: components/ui/SafeContainer.tsx

 Replace web Layout with iOS-native safe area container:

 import { SafeAreaView } from 'react-native-safe-area-context';
 import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
 import { AuroraBackground } from './AuroraBackground';

 export function SafeContainer({ children, scrollable = false }) {
   const Content = scrollable ? ScrollView : View;

   return (
     <SafeAreaView className="flex-1 bg-black">
       <AuroraBackground />
       <KeyboardAvoidingView behavior="padding" className="flex-1">
         <Content className="flex-1 px-6">
           {children}
         </Content>
       </KeyboardAvoidingView>
     </SafeAreaView>
   );
 }

 4.3 AuroraBackground

 File: components/ui/AuroraBackground.tsx
 From: D:\developments\MyDecision_V3\components\AuroraBackground.tsx

 Changes:
 - Replace framer-motion with moti or react-native-reanimated
 - Use StyleSheet.absoluteFill instead of fixed positioning
 - Use LinearGradient for better performance

 import { View, StyleSheet } from 'react-native';
 import { MotiView } from 'moti';

 export function AuroraBackground() {
   return (
     <View style={StyleSheet.absoluteFill} pointerEvents="none">
       <MotiView
         from={{ scale: 1, opacity: 0.3 }}
         animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
         transition={{ type: 'timing', duration: 10000, loop: true }}
         className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-indigo-900/30 rounded-full"        
       />
     </View>
   );
 }

 ---
 Phase 5: DecisionBubbleView Physics Migration (CRITICAL)

 File: components/decision/DecisionBubbleView.tsx
 From: D:\developments\MyDecision_V3\components\DecisionBubbleView.tsx

 5.1 Web → Native API Mapping
 ┌──────────────────────────────────┬─────────────────────────────────────┐
 │             Web API              │      React Native Replacement       │
 ├──────────────────────────────────┼─────────────────────────────────────┤
 │ ResizeObserver                   │ onLayout callback                   │
 ├──────────────────────────────────┼─────────────────────────────────────┤
 │ requestAnimationFrame            │ useFrameCallback (Reanimated)       │
 ├──────────────────────────────────┼─────────────────────────────────────┤
 │ Touch events (onMouseDown, etc.) │ Gesture.LongPress() + Gesture.Tap() │
 ├──────────────────────────────────┼─────────────────────────────────────┤
 │ navigator.vibrate                │ Haptics.impactAsync()               │
 ├──────────────────────────────────┼─────────────────────────────────────┤
 │ CSS absolute positioning         │ Animated.View with style object     │
 └──────────────────────────────────┴─────────────────────────────────────┘
 5.2 Physics Hook

 File: hooks/usePhysics.ts

 Extract physics simulation logic into reusable hook:

 import { useState, useEffect } from 'react';
 import { useSharedValue, useFrameCallback, runOnJS } from 'react-native-reanimated';

 export function usePhysics(decisions: Decision[], width: number, height: number) {
   const [bubbles, setBubbles] = useState<Bubble[]>([]);
   const isAnimating = useSharedValue(true);

   // Initialize bubbles (same logic as web)
   useEffect(() => {
     if (width === 0 || height === 0) return;

     const activeDecisions = decisions.filter(d => !d.isArchived && d.status !== 'completed');
     const newBubbles = initializeBubbles(activeDecisions, width, height);
     setBubbles(newBubbles);
   }, [decisions, width, height]);

   // Animation loop using Reanimated worklet
   useFrameCallback(() => {
     if (!isAnimating.value) return;

     runOnJS(setBubbles)((prevBubbles) => {
       return prevBubbles.map(bubble => {
         // Physics calculations (bounce, collision)
         return updateBubblePhysics(bubble, width, height);
       });
     });
   });

   return { bubbles };
 }

 5.3 Bubble Component with Gestures

 import { Gesture, GestureDetector } from 'react-native-gesture-handler';
 import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
 import * as Haptics from 'expo-haptics';

 function BubbleItem({ bubble, onPress, onLongPress }) {
   const scale = useSharedValue(1);

   const longPressGesture = Gesture.LongPress()
     .minDuration(800)
     .onStart(() => {
       scale.value = withSpring(0.95);
       runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
       runOnJS(onLongPress)();
     })
     .onEnd(() => {
       scale.value = withSpring(1);
     });

   const tapGesture = Gesture.Tap()
     .onStart(() => {
       scale.value = withSpring(0.95);
     })
     .onEnd(() => {
       scale.value = withSpring(1);
       runOnJS(onPress)();
     });

   const composed = Gesture.Race(longPressGesture, tapGesture);

   const animatedStyle = useAnimatedStyle(() => ({
     transform: [{ scale: scale.value }],
     position: 'absolute',
     left: bubble.x - bubble.radius,
     top: bubble.y - bubble.radius,
     width: bubble.radius * 2,
     height: bubble.radius * 2,
   }));

   return (
     <GestureDetector gesture={composed}>
       <Animated.View style={animatedStyle}>
         <View className={getBubbleStyle(bubble)}>
           <Text numberOfLines={3}>{bubble.text}</Text>
         </View>
       </Animated.View>
     </GestureDetector>
   );
 }

 ---
 Phase 6: Page Migrations

 6.1 Home Page

 File: app/index.tsx
 From: D:\developments\MyDecision_V3\pages\Home.tsx

 Changes:
 - Replace <div> with <View>, <Text>
 - Replace <motion.div> with <MotiView>
 - Wrap in <SafeContainer>

 6.2 Dashboard Page

 File: app/dashboard.tsx
 From: D:\developments\MyDecision_V3\pages\Dashboard.tsx

 Critical Changes:

 1. Remove Portal Pattern:
 // Before: Portal for header controls
 createPortal(<ViewModeToggle />, headerTarget)

 // After: Use Stack.Screen options
 <Stack.Screen
   options={{
     headerRight: () => <ViewModeToggle />
   }}
 />
 2. Replace List Rendering:
 // Before: map() with div
 decisions.map(d => <div key={d.id}>...</div>)

 // After: FlatList
 <FlatList
   data={decisions}
   renderItem={({ item }) => <DecisionListItem decision={item} />}
   keyExtractor={(item) => item.id}
 />
 3. Long Press Gesture:
 // Already using setTimeout(800ms) - keep logic
 // Add Haptics.impactAsync() before navigation

 6.3 CreateDecision Page

 File: app/new.tsx
 From: D:\developments\MyDecision_V3\pages\CreateDecision.tsx

 Critical Changes:

 1. TextArea → TextInput:
 // Before
 <textarea className="..." />

 // After
 <TextInput
   multiline
   numberOfLines={4}
   className="..."
 />
 2. Date Input → DateTimePicker:
 import DateTimePicker from '@react-native-community/datetimepicker';

 const [showPicker, setShowPicker] = useState(false);
 const [date, setDate] = useState(new Date());

 <Pressable onPress={() => setShowPicker(true)}>
   <Text>{date.toLocaleDateString()}</Text>
 </Pressable>

 {showPicker && (
   <DateTimePicker
     value={date}
     mode="date"
     display="spinner"
     onChange={(e, selectedDate) => {
       setShowPicker(false);
       if (selectedDate) setDate(selectedDate);
     }}
     themeVariant="dark"
   />
 )}
 3. UUID Generation:
 // Before
 import { crypto } from 'crypto';
 const id = crypto.randomUUID();

 // After
 import uuid from 'react-native-uuid';
 const id = uuid.v4();

 6.4 DecisionDetail Page

 File: app/decision/[id].tsx
 From: D:\developments\MyDecision_V3\pages\DecisionDetail.tsx

 Critical Changes:

 1. Get Route Params:
 // Before
 import { useParams, useSearchParams } from 'react-router-dom';
 const { id } = useParams();
 const [searchParams] = useSearchParams();
 const mode = searchParams.get('mode');

 // After
 import { useLocalSearchParams } from 'expo-router';
 const { id, mode } = useLocalSearchParams();
 2. Replace window.confirm:
 // Before
 if (window.confirm('Are you sure?')) { ... }

 // After
 import { Alert } from 'react-native';
 Alert.alert(
   'Confirm',
   'Are you sure?',
   [
     { text: 'Cancel', style: 'cancel' },
     { text: 'Confirm', onPress: () => { ... } }
   ]
 );
 3. Wrap in ScrollView:
 import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

 <KeyboardAwareScrollView>
   {/* All content */}
 </KeyboardAwareScrollView>

 6.5 Settings Page

 File: app/settings.tsx
 From: D:\developments\MyDecision_V3\pages\Settings.tsx

 Changes:

 1. Clear Data:
 // Before
 localStorage.clear();
 window.location.reload();

 // After
 import AsyncStorage from '@react-native-async-storage/async-storage';
 import { useRouter } from 'expo-router';

 await AsyncStorage.clear();
 router.replace('/dashboard');

 ---
 Phase 7: iOS Design Compliance

 7.1 Navigation Gestures

 // app/_layout.tsx
 <Stack
   screenOptions={{
     headerStyle: { backgroundColor: '#000' },
     headerTintColor: '#fff',
     gestureEnabled: true,        // Swipe back
     animation: 'slide_from_right', // iOS transition
   }}
 />

 7.2 Haptic Feedback

 File: hooks/useHaptics.ts

 import * as Haptics from 'expo-haptics';

 export function useHaptics() {
   return {
     light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
     medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
     heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
     success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
     error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
   };
 }

 Usage:
 - Button press: light()
 - Long press start: medium()
 - Success action: success()
 - Error/delete: error()

 7.3 Safe Areas

 Use react-native-safe-area-context in all screens:

 import { SafeAreaView } from 'react-native-safe-area-context';

 <SafeAreaView className="flex-1">
   {/* Content */}
 </SafeAreaView>

 ---
 Critical Files Reference

 Must Migrate (Priority 0):

 1. D:\developments\MyDecision_V3\context\StoreContext.tsx
   - State management core
   - localStorage → AsyncStorage
   - Add loading/hydration states
 2. D:\developments\MyDecision_V3\components\DecisionBubbleView.tsx
   - Most complex component
   - Physics simulation
   - ResizeObserver → onLayout
   - requestAnimationFrame → useFrameCallback
 3. D:\developments\MyDecision_V3\pages\Dashboard.tsx
   - Portal removal
   - FlatList optimization
   - Header controls migration
 4. D:\developments\MyDecision_V3\pages\DecisionDetail.tsx
   - Largest file (1160 lines)
   - Multiple modes (view/doubt/review/edit)
   - Form inputs, alerts, modals
 5. D:\developments\MyDecision_V3\pages\CreateDecision.tsx
   - Multi-step form
   - Date picker
   - TextInput migration

 Copy Directly:

 1. D:\developments\MyDecision_V3\types.ts → types/index.ts
 2. D:\developments\MyDecision_V3\constants.ts → constants/index.ts

 ---
 Migration Order

 Week 1: Foundation

 1. Initialize Expo project
 2. Install dependencies
 3. Configure NativeWind, Babel, Metro
 4. Migrate StoreContext (AsyncStorage)
 5. Set up root layout with providers
 6. Copy types and constants

 Week 2: Core Components

 1. Button component
 2. SafeContainer (replace Layout)
 3. AuroraBackground
 4. Home page
 5. Settings page (simple)

 Week 3: Complex Components

 1. DecisionBubbleView physics migration
 2. Physics hook extraction
 3. Gesture handling
 4. Dashboard page
 5. Portal removal

 Week 4: Forms & Polish

 1. CreateDecision (forms, date picker)
 2. DecisionDetail (largest file)
 3. Remaining modals and components
 4. iOS design polish (haptics, safe areas)
 5. Testing and bug fixes

 ---
 Verification Plan

 Test Checklist:

 State Management:
 - Data persists across app restarts (AsyncStorage)
 - Loading indicator shows during hydration
 - All CRUD operations work (add, update, delete)

 Physics Simulation:
 - Bubbles initialize correctly
 - Animation runs smoothly at 60fps
 - Bubbles bounce off walls
 - Due bubbles stay at bottom
 - Long press (800ms) opens doubt mode
 - Tap opens decision detail

 Navigation:
 - All routes navigate correctly
 - Back button works (iOS swipe gesture)
 - Query params work (/decision/:id?mode=doubt)
 - Navigation stack resets on logout

 Forms:
 - TextInput keyboard shows and hides properly
 - Date picker shows iOS native picker
 - Multi-step form preserves state
 - Form validation works

 iOS Features:
 - Safe areas respected (notch, home indicator)
 - Haptic feedback on interactions
 - Dark theme matches iOS guidelines
 - Gestures work (swipe back, long press)

 Performance:
 - App launches in < 2 seconds
 - No memory leaks from animation loop
 - FlatList scrolls smoothly
 - No janky animations

 Testing Commands:

 # Start development
 npx expo start

 # Run on iOS simulator
 npx expo run:ios

 # Build preview
 eas build --profile preview --platform ios

 Manual Testing:

 1. Create Decision Flow: Home → New → Fill form → Save → Verify in Dashboard
 2. Doubt Review: Dashboard → Long press bubble (800ms) → Opens doubt mode
 3. Edit Decision: Dashboard → Tap bubble → Tap "Edit" → Modify → Save
 4. Persistence: Create decision → Force quit app → Reopen → Verify data exists
 5. Physics: Dashboard → Watch bubbles float → Due bubble stays at bottom
 6. Haptics: Enable haptics in Settings → Test all interactions

 ---
 Common Pitfalls & Solutions

 1. AsyncStorage Loading State

 Problem: Blank screen during hydration
 Solution: Show ActivityIndicator in StoreProvider

 2. Physics Animation Performance

 Problem: Choppy bubble animation
 Solution: Use useFrameCallback, limit bubble count, use worklets

 3. Keyboard Covering Inputs

 Problem: Keyboard hides TextInput
 Solution: Wrap in KeyboardAvoidingView with behavior="padding"

 4. Portal Pattern

 Problem: No createPortal in RN
 Solution: Use Stack.Screen headerRight/headerLeft options

 5. Date Picker Styling

 Problem: Native picker looks different
 Solution: Embrace iOS-native picker, use display="spinner"

 ---
 Success Criteria

 Migration is complete when:

 1. ✅ All pages render correctly on iOS
 2. ✅ Navigation works with iOS gestures
 3. ✅ State persists with AsyncStorage
 4. ✅ Physics simulation runs at 60fps
 5. ✅ Forms work with native iOS inputs
 6. ✅ App follows iOS design guidelines
 7. ✅ No web-specific APIs remain
 8. ✅ All tests pass
 9. ✅ App builds successfully with EAS
 10. ✅ Performance is smooth on real device

 ---
 End of Plan