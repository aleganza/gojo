import { PrimaryButton } from "@/components/ui/buttons";
import { Frame } from "@/components/ui/frame/frame";
import { H1, Heading } from "@/components/ui/headings";
import { Input } from "@/components/ui/input";
import Spacer from "@/components/ui/spacer";
import { Txt } from "@/components/ui/texts";
import { useAuth } from "@/lib/supabase/auth/useAuth";
import { useTheme } from "@/lib/theme/useTheme";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Pressable } from "react-native";

export default function LoginScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Errore", "Inserisci email e password");
      return;
    }

    setLoading(true);
    const { error } = await login({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Errore", error.message);
    }
    // redirect is automatically handled by the root layout
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
      <H1 text={"Accedi"} />

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
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Spacer />

      <PrimaryButton
        onPress={handleLogin}
        disabled={loading}
        size="md"
        fullWidth
      >
        {loading ? "Caricamento..." : "Accedi"}
      </PrimaryButton>

      <Link href="/(auth)/register" asChild>
        <Pressable
          style={{
            marginTop: 20,
          }}
        >
          <Txt
            style={{
              textAlign: "center",
              color: theme.colors.primary,
              fontSize: theme.fontSize.base,
            }}
          >
            Non hai un account? Registrati
          </Txt>
        </Pressable>
      </Link>
    </Frame>
  );
}
