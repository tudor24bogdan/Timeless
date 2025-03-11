import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, View, TouchableWithoutFeedback, Keyboard, ScrollView, Image, Modal, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as ImagePicker from 'expo-image-picker';

import { createPostInDatabase, getCurrentUser } from '../../lib/appwrite';


export default function TabTwoScreen() {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false); 
  const [photos, setPhotos] = useState<any[]>([]); 
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [imageUris, setImageUris] = useState<string[]>([]);

  
  
  const handlePost = async () => {
    try {
        const currentUser = await getCurrentUser(); // Obține utilizatorul curent
        console.log("Current user:", currentUser);
        if (!currentUser) {
            Alert.alert('Trebuie să fii autentificat pentru a posta!');
            return;
        }

        // Convert price to number
        const priceValue = parseFloat(price);
        if (isNaN(priceValue)) {
            alert('Introduceți un preț valid!');
            return;
        }

        // Apelează funcția createPostInDatabase
        const response = await createPostInDatabase(
            `${brand} ${model}`, // Titlu
            priceValue,
            isNegotiable,
            description,
            brand,
            model,
            currentUser.$id,
            imageUris
        );

        alert('Postarea a fost creată cu succes!');
        console.log('Response:', response);

        // Resetează formularul după succes
        setBrand('');
        setModel('');
        setPrice('');
        setDescription('');
        setIsNegotiable(false);
        setPhotos([]);
    } catch (error) {
        console.error('Error creating post:', error);
        alert('A apărut o eroare la crearea postării.');
    }
};

  // Function to launch image picker
  const pickImage = async () => {
    // Ask for permission to access the camera roll
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access media library is required!');
      return;
    }

    // Launch image picker
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
      allowsMultipleSelection: true
    });

    if (!pickerResult.canceled) {
      const selectedUris = pickerResult.assets.map(asset => asset.uri);
      setImageUris(selectedUris);
    }
  };

  
  const removePhoto = (uri: string) => {
    setImageUris((prevUris) => {
      const updatedUris = prevUris.filter(photoUri => photoUri !== uri);
      console.log('Updated URIs:', updatedUris); // Check if the state updates correctly
      return updatedUris;
    });
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          onScroll={() => Keyboard.dismiss()} // Hide keyboard on scroll
          scrollEventThrottle={16} 
        >
          <ThemedText style={styles.title}>Vinde un ceas</ThemedText>

          {/* Brand Selection */}
          <Text style={styles.inputLabel}>Brand</Text>
          <TouchableOpacity style={styles.input} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.inputText}>{brand || 'Selecteaza'}</Text>
          </TouchableOpacity>

          {/* Model Input */}
          <Text style={styles.inputLabel}>Model</Text>
          <TextInput
            style={styles.input}
            placeholder="Model"
            value={model}
            onChangeText={setModel}
          />

          {/* Price Input */}
          <Text style={styles.inputLabel}>Pret</Text>
          <TextInput
            style={styles.input}
            placeholder="Pret"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          {/* Price Negotiable Checkbox */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setIsNegotiable(!isNegotiable)}
            >
              <View
                style={[styles.checkboxSquare, isNegotiable ? styles.checked : styles.unchecked]}
              />
              <Text style={styles.checkboxLabel}>Pretul e negociabil</Text>
            </TouchableOpacity>
          </View>

          {/*Description Field */}
          <Text style={styles.inputLabel}>Descriere</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Descriere"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Add Photos Section */}
          <View style={styles.addPhotoContainer}>
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
              <Text style={styles.addPhotoText}>Adauga poze</Text>
            </TouchableOpacity>
            <View style={styles.photosContainer}>
            {imageUris.length > 0 ? (
              imageUris.map((uri, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <Image source={{ uri }} style={styles.photo} />
                  {/* Remove Button */}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removePhoto(uri)} // Trigger remove on press
                  >
                    <Text style={styles.removeButtonText}>X</Text>
                  </TouchableOpacity>
                </View>
                ))
              ) : (
                <Text style={styles.noPhotosText}>Nu au fost adaugate poze</Text>
              )}
            </View>
          </View>
        </ScrollView>

      
        <TouchableOpacity style={styles.button} onPress={handlePost}>
          <Text style={styles.buttonText}>Vinde!</Text>
        </TouchableOpacity>

        
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Brand</Text>
              <Picker
                selectedValue={brand}
                onValueChange={(itemValue) => setBrand(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Rolex" value="Rolex" color='white' />
                <Picker.Item label="Casio" value="Casio" color='white' />
                <Picker.Item label="Altul" value="Altul" color='white' />
              </Picker>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    position: 'relative', 
  },
  scrollContainer: {
    paddingBottom: 100, 
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 35, 
    textAlign: 'center',
    marginBottom: 20, 
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputText: {
    color: 'white',
    fontSize: 16,
  },
  descriptionInput: {
    color: 'white',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    height: 150, 
    textAlignVertical: 'top', 
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxSquare: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: 6,
    marginLeft: 0,
  },
  checked: {
    backgroundColor: '#FFC107', // Yellow when checked
    borderColor: '#FFC107',
  },
  unchecked: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  checkboxLabel: {
    fontSize: 16,
    marginLeft: 6,
    color: 'white',
  },
  addPhotoContainer: {
    marginBottom: 20,
  },
  addPhotoButton: {
    backgroundColor: 'transparent', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#FFC107', // Yellow border 
    borderRadius: 8,
    alignItems: 'center',
  },
  addPhotoText: {
    color: 'white',
    fontSize: 16,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  photoWrapper: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 0,
    marginTop: 10,
    marginLeft: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: -2,
    backgroundColor: 'grey', 
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noPhotosText: {
    fontSize: 14,
    color: 'gray',
  },
  button: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFC107', // Yellow background
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#fff', 
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255, 0.3)',
  },
  modalContainer: {
    backgroundColor: 'black',
    borderRadius: 20,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
  },
  picker: {
    height: 150,
    width: '100%',
    backgroundColor: 'black',
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
