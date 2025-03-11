import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { getPostsFromDatabase } from '../../lib/appwrite';

interface BuyDetailsProps {
  id: string;
}

export default function BuyDetails({ id }: BuyDetailsProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  console.log("Item received : " + id);
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const posts = await getPostsFromDatabase();
        posts.forEach((post: any) => {
          //console.log(" ID AICI : " + post.$id);
        })
        const productDetails = posts.find((post: any) => post.$id === id);
        setProduct(productDetails);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Produsul nu a fost găsit.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: `https://cloud.appwrite.io/v1/storage/buckets/677fd66d000068a666c3/files/${product.photoId}/download?project=67347d0b0023d2d99e5a`,
        }}
        style={styles.image}
      />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.details}>Brand: {product.brand}</Text>
      <Text style={styles.details}>Model: {product.model}</Text>
      <Text style={styles.details}>Preț: ${product.price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  details: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    color: '#FF5252',
    textAlign: 'center',
  },
});
