import { PrimaryButton } from "@/components/ui/buttons";
import { Frame } from "@/components/ui/frame/frame";
import { H1 } from "@/components/ui/headings";
import { Input } from "@/components/ui/input";
import Spacer from "@/components/ui/spacer";
import { useAuth } from "@/lib/supabase/auth/useAuth";
import { useTheme } from "@/lib/theme/useTheme";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text } from "react-native";

export default function RegisterScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !nickname) {
      Alert.alert("Errore", "Compila tutti i campi");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Errore", "Le password non corrispondono");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Errore", "La password deve essere di almeno 6 caratteri");
      return;
    }

    setLoading(true);

    const { error } = await register({
      email,
      password,
      options: {
        data: {
          username: nickname,
        },
      },
    });

    setLoading(false);

    if (error) {
      console.log(error);
      Alert.alert("Errore", error.message);
    } else {
      Alert.alert(
        "Successo",
        "Registrazione completata! Controlla la tua email per confermare l'account.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(auth)/login"),
          },
        ],
      );
    }
  };

  return (
    <Frame
      tight
      useSafeArea
      keyboardAvoiding
      contentContainerStyle={{
        justifyContent: "center",
      }}
    >
      <H1 text={"Registrati"} />

      <Spacer />

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Spacer size="sm" />

      <Input
        placeholder="Nickname"
        value={nickname}
        onChangeText={setNickname}
        autoCapitalize="none"
      />

      <Spacer size="sm" />

      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Spacer size="sm" />

      <Input
        placeholder="Conferma Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Spacer />

      <PrimaryButton
        onPress={handleRegister}
        disabled={loading}
        size="md"
        fullWidth
      >
        {loading ? "Caricamento..." : "Registrati"}
      </PrimaryButton>

      <Link href="/(auth)/login" asChild>
        <Pressable
          style={{
            marginTop: 20,
          }}
        >
          <Text
            style={{
              color: "#007AFF",
              textAlign: "center",
              fontSize: 14,
            }}
          >
            Hai già un account? Accedi
          </Text>
        </Pressable>
      </Link>
    </Frame>
  );
}
