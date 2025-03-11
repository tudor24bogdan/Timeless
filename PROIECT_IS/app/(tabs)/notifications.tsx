import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator, TouchableOpacity, Modal, RefreshControl } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getNotifications } from '@/lib/appwrite'; // Assuming this function exists

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [notifications, setNotifications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const charLimit = 38; // Limit the number of characters shown in the list

  // Fetch notifications (used for both initial load and refreshing)
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedNotifications = await getNotifications();
      setNotifications(fetchedNotifications);
      setError(null);
    } catch (err: any) {
      setError('Eroare la obținerea notificărilor.');
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop refresh spinner
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
  };

  const handleNotificationPress = (notification: string) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const renderNotification = ({ item }: { item: string }) => {
    const truncatedText = item.length > charLimit ? item.substring(0, charLimit) + '...' : item;

    return (
      <TouchableOpacity onPress={() => handleNotificationPress(item)} activeOpacity={0.8}>
        <View style={styles.notificationBox}>
          <Text style={styles.notificationText}>
            {truncatedText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
        <ActivityIndicator size="large" color="gold" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
        <Text style={[styles.text, { color: 'gold' }]}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
      <Text style={[styles.headerText, { color: isDarkMode ? 'gold' : 'black' }]}>
        Notifications
      </Text>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderNotification}
          contentContainerStyle={styles.flatListContainer}
          style={styles.flatList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing} // Indicates if the list is refreshing
              onRefresh={onRefresh} // Callback triggered on pull
              tintColor="gold" // Spinner color for light mode
              colors={['gold']} // Spinner color for dark mode
            />
          }
        />
      ) : (
        <Text style={[styles.text, { color: isDarkMode ? 'gold' : 'black' }]}>
          Nu există notificări.
        </Text>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
            <Text style={styles.modalText}>
              {selectedNotification}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    width: '100%',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
  headerText: {
    paddingTop: 80,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  flatListContainer: {
    paddingTop: 10,
    flexGrow: 1,
  },
  flatList: {
    width: '100%',
  },
  notificationBox: {
    backgroundColor: '#212121',
    borderWidth: 0.25,
    borderColor: '#696969',
    padding: 20,
    borderRadius: 0,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 0,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    padding: 20,
    borderRadius: 12,
    width: '80%',
    backgroundColor: '#333',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
