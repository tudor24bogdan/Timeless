import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router'; 
import { loginUser } from '../../lib/appwrite';

export default function SignIn() {
  const colorScheme = useColorScheme();
  const router = useRouter(); 

  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all the fields');
      return;
    }
    
    console.log('Attempting login with email:', email);
    setIsSubmitting(true);

    try {
      await loginUser(email, password);
      router.replace('/(tabs)/profile'); // Navigate to profile or another route
      console.log('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to log in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome Back</Text>
      <Text style={styles.subheader}>Sign in to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity 
        style={[styles.button, isSubmitting && styles.buttonDisabled]} 
        onPress={handleSignIn} 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} style={styles.link}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

// Hide header for this screen
SignIn.options = {
  headerShown: false, // Hides the header
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212', // Dark background for dark mode
    justifyContent: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700', // Gold text
    textAlign: 'center',
    marginBottom: 10,
  },
  subheader: {
    fontSize: 16,
    color: '#aaa', // Light grey text
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
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#4d4d4d', // Disabled button
  },
  buttonText: {
    color: '#000', // Black text on gold button
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#FFD700', // Gold color for link
    fontSize: 14,
  },
});
