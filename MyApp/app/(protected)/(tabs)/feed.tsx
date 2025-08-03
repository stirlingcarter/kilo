import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function FeedScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Friends Feed</ThemedText>
      <ThemedText style={styles.description}>
        A timeline of reviews from the friends you follow will appear here.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  description: {
    marginTop: 16,
    textAlign: 'center',
  },
}); 