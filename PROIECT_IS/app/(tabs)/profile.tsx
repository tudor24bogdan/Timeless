import { Image, StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '../GlobalProvider';
import { logOutUser } from '@/lib/appwrite';
import { fetchUserPosts } from '@/lib/appwrite';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';


interface Post {
  $id: string;
  $title: string;
  $description: string;
  $photoId: string;
}


export default function TabTwoScreen() {
  const router = useRouter();
  const { isLoggedIn, user, setIsLoggedIn, setUser } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const loadUserPosts = async () => {
    console.log("DADADA" + user?.avatar)
    try {
      if (!user) return;

      setLoading(true);
      const userPosts = await fetchUserPosts(user.$id);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserPosts();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logOutUser();
      setIsLoggedIn(false);
      setUser(null);
      router.push('/(tabs)/profile');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadUserPosts();
    setIsRefreshing(false);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <Text style={styles.postTitle}>{item.$title || 'No Title'}</Text>
      <Text style={styles.postDescription}>{item.$description || 'No Description'}</Text>
      {item.$photoId && (
        <Image
          source={{ uri: `https://cloud.appwrite.io/v1/storage/buckets/677fd66d000068a666c3/files/${item.$photoId}/download?project=67347d0b0023d2d99e5a` }}
          style={styles.postImage}
          accessibilityLabel={`Image of ${item.$title}`}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}

      {/* Main Content */}
      {isLoggedIn ? (
        <>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: user?.avatar || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg' }}
              style={styles.avatar}
            />
            <ThemedText style={[styles.welcomeText, isDarkMode && styles.darkText]}>
              Welcome, {user?.username || 'User'}!
            </ThemedText>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <ThemedText style={styles.signOutButtonText}>Sign Out</ThemedText>
            </TouchableOpacity>
          </View>

          {/* FlatList for rendering posts */}
          {loading ? (
            <ThemedText style={styles.infoText}>Loading posts...</ThemedText>
          ) : (
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.$id}
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
              ListEmptyComponent={<Text style={styles.noPostText}>You haven't posted anything yet</Text>}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        <View style={styles.signInContainer}>
          <ThemedText style={styles.infoText}>You are not logged in.</ThemedText>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/sign-up')}>
            <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.signInButton]} onPress={() => router.push('/(auth)/sign-in')}>
            <ThemedText style={styles.buttonText}>Sign In</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginTop: 60, // Add marginTop to prevent clipping at the top
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  signOutButton: {
    backgroundColor: '#FF5252',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    width: '80%',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 20,
    color: '#f5f5f5',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    width: '80%',
  },
  signInButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  postDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  noPostText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#ffffff',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  darkText: {
    color: '#FFD700', // Gold text color for dark mode
  },
  signInContainer: {
    flex: 1,
    justifyContent: 'center',  // Ensures buttons are centered vertically
    alignItems: 'center',      // Ensures buttons are centered horizontally
    paddingHorizontal: 20,     // To prevent buttons from touching the edges
  },
});
