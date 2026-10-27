import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { BACKEND_API_URL } from "../../../config_base_url";


export default function ChildLinkScreen() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleLink = async () => {
        if (!code.trim()) {
            setMessage("Please enter your code.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {

            console.log('trying-0');

            const res = await fetch(`${BACKEND_API_URL}/link-device`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deviceId: code,
                    linkedDeviceType: "android",  // get from device info
                    linkedDeviceModel: "Pixel 6"  // get from device info
                }),
            });
            console.log(res);
            console.log('trying-1');


            const data = await res.json();


            if (data.success) {
                setMessage("Device linked successfully!");
            } else {
                setMessage(data.message || "Invalid code.");
            }
        } catch (e) {
            setMessage("Network error.");
        }

        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Animated.View
                entering={FadeInUp.duration(600)}
                style={styles.card}
            >
                <Text style={styles.title}>Enter Your Device Code</Text>
                <Text style={styles.subtitle}>
                    Paste the code your parent shared with you.
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="e.g. DEV-17-1764742426292"
                    value={code}
                    onChangeText={setCode}
                    autoCapitalize="none"
                />

                <TouchableOpacity style={styles.button} onPress={handleLink}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Link Device</Text>
                    )}
                </TouchableOpacity>

                {message ? (
                    <Text
                        style={[
                            styles.message,
                            { color: message.includes("success") ? "green" : "red" }
                        ]}
                    >
                        {message}
                    </Text>
                ) : null}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#4e8cff",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    card: {
        width: "100%",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 25,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
        color: "#1f1f1f",
    },
    subtitle: {
        fontSize: 14,
        textAlign: "center",
        color: "#555",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#f0f4ff",
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1.5,
        borderColor: "#c7d6ff",
        marginBottom: 15,
    },
    button: {
        backgroundColor: "#4e8cff",
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 17,
        fontWeight: "600",
    },
    message: {
        marginTop: 15,
        textAlign: "center",
        fontSize: 14,
    },
});
