import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { createUser } from '../../lib/appwrite';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router'; 

export default function SignUp() {
  const colorScheme = useColorScheme();
  const router = useRouter(); 

  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function register(email: string, password: string, name: string, firstname: string, lastname: string){
    console.log("firstname, lastname in register func : " , firstname, lastname);
    try {
      await createUser(email, password, name, firstname, lastname);  // name is taken from username field 
      router.push('/(tabs)/profile'); // Navigate to profile screen after successful registration
    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('Error', 'There was an issue with registration. Please try again.');
    }
  }

  const PressButton = () => {
    if (!firstname || !lastname || !username || !email || !password) {
      Alert.alert('Error', 'Please fill in all the fields');
      return;
    }

    setIsSubmitting(true);
    console.log("firstname, lastname in Press: " , firstname, lastname);
    register(email, password, username, firstname, lastname);
    setIsSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstname}
        onChangeText={(firstname) => setFirstname(firstname)}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastname}
        onChangeText={(lastname) => setLastname(lastname)}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(username) => setUsername(username)}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(email) => setEmail(email)}
        keyboardType="email-address"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(password) => setPassword(password)}
        secureTextEntry
        placeholderTextColor="#888"
      />

      <TouchableOpacity 
        style={[styles.button, isSubmitting && styles.buttonDisabled]} 
        onPress={PressButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',  // Dark background for dark mode
    justifyContent: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',  // Gold text
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#1f1f1f', // Dark grey input background
    color: '#fff', // White text
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333', // Dark border
  },
  button: {
    backgroundColor: '#FFD700', // Gold button background
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#4d4d4d', // Disabled button color
  },
  buttonText: {
    color: '#000', // Black text on gold button
    fontSize: 16,
    fontWeight: 'bold',
  },
});
