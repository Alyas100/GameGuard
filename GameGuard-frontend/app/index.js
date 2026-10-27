import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const restoreSession = async () => {
            try {
                const userId = await AsyncStorage.getItem("userId");

                if (isMounted) {
                    router.replace(userId ? "/dashboard" : "/custom-login");
                }
            } catch (error) {
                console.error("Unable to restore the saved login session:", error);

                if (isMounted) {
                    router.replace("/custom-login");
                }
            }
        };

        restoreSession();

        return () => {
            isMounted = false;
        };
    }, [router]);

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <ActivityIndicator size="large" color="#4285F4" />
        </View>
    );
}
