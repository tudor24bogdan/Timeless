import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, Text, FlatList, Modal, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { getPostsFromDatabase,createOrder, getCurrentUser, sendNotificationToUser, deletePostFromDatabase } from '../../lib/appwrite';

export default function HomeScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<any | null>(null); // Store the selected post
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false); // Control the modal visibility
  const [adresa, setAdresa] = useState<string>('');
  const [zipCode, setZipCode] = useState<string>(''); // Nouă variabilă
  const [phoneNumber, setPhoneNumber] = useState<string>(''); // Nouă variabilă
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Fetch posts from the database
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const fetchedPosts = await getPostsFromDatabase();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const checkIfLoggedIn = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('User not logged in:', error);
    }
  };

  useEffect(() => {
    //checkIfLoggedIn(); // Verificăm autentificarea utilizatorului
    fetchPosts(); // Fetchăm postările din baza de date
  }, []);

  // Handle refreshing the posts
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts();
    setIsRefreshing(false);
  };

  // Handle the "Buy" button click
  const handleBuy = (item: any) => {
    checkIfLoggedIn();
    if (!currentUser) {
      Alert.alert('Autentificare necesară', 'Trebuie să fii autentificat pentru a face o achiziție.');
      return;
    }




    if(item == null || selectedPost == null){
      setSelectedPost(item);
      return;

    }
    setSelectedPost(item);

    if(selectedPost.userId == currentUser.$id){
      console.log("can't buy own item");
      Alert.alert("Imposibil" , "Nu poti cumpara propriul articol");
      return;
    }
    setIsModalVisible(true);
  };
  const handlePlaceOrder = async () => {
    checkIfLoggedIn();
    if(selectedPost.userId == null) return ;
    if (!adresa.trim() || !zipCode.trim() || !phoneNumber.trim()) {
      alert('Te rugăm să completezi toate câmpurile!');
      return;
    }
    try {
      const idOrder = `ORD-${new Date().getTime()}`;
      const response = await createOrder(adresa, zipCode, phoneNumber, idOrder, selectedPost.price);

      await sendNotificationToUser(
        selectedPost.userId, // Assuming this is the seller's userId
        currentUser.username,
        `Ai primit o comandă nouă pentru ${selectedPost.title}!. Ai 3 zile la dispozitie sa o trimiti 
        la adresa: ${adresa}, ${zipCode}, ${phoneNumber}. Pretul vanzarii: ${selectedPost.price}. Order ID: ${idOrder}`
    );

    await deletePostFromDatabase(selectedPost.$id);
    
      alert('Comanda a fost plasată cu succes!');
      console.log('Order response:', response);

      setIsModalVisible(false);
      setAdresa('');
      setZipCode('');
      setPhoneNumber('');
      setSelectedPost(null);

      await handleRefresh;
      await fetchPosts();
    } catch (error) {
      console.error('Eroare la plasarea comenzii:', error);
      alert('A apărut o eroare la plasarea comenzii.');
    }
  };

  // Render each post card
  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postCard}>
      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postDescription}>{item.description}</Text>
      <Text style={styles.postDetails}>Price: ${item.price}</Text>
      <Text style={styles.postDetails}>Brand: {item.brand}</Text>
      <Text style={styles.postDetails}>Model: {item.model}</Text>
      {item.photoId && (
        <Image
          source={{
            uri:
              'https://cloud.appwrite.io/v1/storage/buckets/677fd66d000068a666c3/files/' +
              item.photoId +
              '/download?project=67347d0b0023d2d99e5a',
          }}
          style={styles.postImage}
          accessibilityLabel={`Image of ${item.title}`}
        />
      )}
      <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(item)}>
        <Text style={styles.buyButtonText}>BUY</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* List Header - Logo and subtitle */}
      <View style={styles.headerContainer}>
        <Image
          source={require('@/assets/images/logoTimeless.png')}
          style={styles.reactLogo}
          accessibilityLabel="Timeless logo"
        />
        <ThemedText type="subtitle" style={styles.text}>
          Elegance that stands the test of time
        </ThemedText>
      </View>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFC107" />
          <Text style={styles.loadingText}>Se încarcă postările...</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.listContainer}
          onRefresh={handleRefresh} // Utilizează handleRefresh pentru pull-to-refresh
          refreshing={isRefreshing} // Arată indicatorul de refresh
          ListEmptyComponent={
            <Text style={styles.noPostText}>Nu există postări disponibile.</Text>
          }
        />
      )}

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedPost && (
              <>
                <Text style={styles.modalTitle}>{selectedPost.title}</Text>
                <Text style={styles.modalDescription}>{selectedPost.description}</Text>
                <Text style={styles.modalPrice}>Price: ${selectedPost.price}</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Introdu adresa de livrare"
                  placeholderTextColor="#FFC107"
                  value={adresa}
                  onChangeText={setAdresa}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Introdu codul poștal"
                  placeholderTextColor="#FFC107"
                  value={zipCode}
                  onChangeText={setZipCode}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Introdu numărul de telefon"
                  placeholderTextColor="#FFC107"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />

                <TouchableOpacity
                  style={styles.placeOrderButton}
                  onPress={handlePlaceOrder}
                >
                  <Text style={styles.placeOrderButtonText}>Place Order</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background for the main screen
  },
  headerContainer: {
    alignItems: 'center', // Center the logo and subtitle
    marginTop: 20,
  },
  reactLogo: {
    height: 180,
    width: 270,
    borderRadius: 25,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#ffffff',
    marginTop: 10,
  },
  postCard: {
    backgroundColor: '#ffffff', // Keep the posts white
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
    color: '#333', // Dark text for white background
  },
  postDescription: {
    fontSize: 14,
    color: '#555', // Dark text for white background
    marginBottom: 10,
  },
  postDetails: {
    fontSize: 12,
    color: '#999', // Dark text for white background
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
    color: '#ffffff', // White text for the dark background
    marginTop: 20,
  },
  buyButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50', // Verde
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  modalPrice: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  modalDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    width: '100%',
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
