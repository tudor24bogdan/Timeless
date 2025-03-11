import React, { useState } from 'react';
import { StyleSheet, TextInput, FlatList, Text, View, Image } from 'react-native';
import { searchPostsLocally, getImageUrlFromId } from '@/lib/appwrite';

export default function BuyScreen() {
    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);



    const handleSearch = async () => {
        setIsLoading(true);
        try {
            const posts = await searchPostsLocally(searchText);
            setResults(posts);
        } catch (error) {
            console.error('Error searching posts:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleRefresh = async () => {
      setIsRefreshing(true); 
      try {
          const posts = await searchPostsLocally(searchText); 
          setResults(posts);
      } catch (error) {
          console.error('Error refreshing posts:', error);
      } finally {
          setIsRefreshing(false); 
      }
  };

    const renderPost = ({ item }: { item: any }) => (
        <View style={styles.postCard}>
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postDescription}>{item.description}</Text>
          <Text style={styles.postDetails}>Price: ${item.price}</Text>
          <Text style={styles.postDetails}>Brand: {item.brand}</Text>
          <Text style={styles.postDetails}>Model: {item.model}</Text>
          {item.photoId && (
            <Image
              source={{ uri: 'https://cloud.appwrite.io/v1/storage/buckets/677fd66d000068a666c3/files/' + item.photoId + '/download?project=67347d0b0023d2d99e5a' }}
              style={styles.postImage}
              accessibilityLabel={`Image of ${item.title}`}
            />
          )}
        </View>
      );
      

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Caută ceasul dorit..."
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
            />
            {isLoading ? (
                <Text style={styles.loadingText}>Se caută...</Text>
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderPost}
                    keyExtractor={(item) => item.$id}
                    ListEmptyComponent={<Text style={styles.noResultsText}>Nicio postare găsită.</Text>}
                    refreshing={isRefreshing} 
                    onRefresh={handleRefresh} 
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#121212',
    },
    searchInput: {
        backgroundColor: '#1f1f1f',
        color: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        marginTop: 80,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    postCard: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    postDescription: {
        fontSize: 14,
        color: '#555',
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginTop: 10,
    },
    loadingText: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
    },
    noResultsText: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 20,
    },
    postDetails: {
      fontSize: 12,
      color: '#999',
      marginBottom: 10,
    },
});
