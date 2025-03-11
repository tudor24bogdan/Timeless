import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WelcomeBtn from "../components/WelcomeBtn";

export default function App() {
    const router = useRouter();

    const navigateToSignIn = () => {
        router.push("/(auth)/sign-in"); 
    };

    const navigateToSignUp = () => {
        router.push("/(auth)/sign-up"); 
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <ScrollView contentContainerStyle={{ height: '100%', backgroundColor: '#000' }}>
                <View style={styles.container}>
                    <Image
                        source={require('@/assets/images/logoTimeless.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>
                            Discover Endless{"\n"}
                            Possibilities with{" "}
                            <Text style={styles.highlightedText}>us</Text>
                        </Text>
                    </View>

                    <WelcomeBtn onPress={() => router.replace("/(tabs)/")} />

                    <View style={styles.authButtonsContainer}>
                        <TouchableOpacity style={styles.authButton} onPress={navigateToSignIn}>
                            <Text style={styles.authButtonText}>Log In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.authButton} onPress={navigateToSignUp}>
                            <Text style={styles.authButtonText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <StatusBar style="light" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    logo: {
        width: 100,
        height: 100,
    },
    titleContainer: {
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    highlightedText: {
        color: '#FFC107', 
    },
    authButtonsContainer: {
        marginTop: 30,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    authButton: {
        backgroundColor: '#FFC107', 
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    authButtonText: {
        color: '#000', 
        fontSize: 16,
        fontWeight: 'bold',
    },
});
